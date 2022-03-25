(define-keyset 'election-admin-keyset)

(module election GOVERNANCE
  "Simple voting module"

  (use coin [ details ])

  ; ----------------------------------------------------------------------
  ; Schema

  (defschema candidates-schema
    "Candidates table schema"
    name:string
    votes:integer)

  (defschema votes-schema
    "Votes table schema"
    candidate:string
  )

  ; ----------------------------------------------------------------------
  ; Tables

  (deftable votes:{votes-schema})

  (deftable candidates:{candidates-schema})

  ; ----------------------------------------------------------------------
  ; Capabilities

  (defcap GOVERNANCE ()
    "Only admin can update this module"
    (enforce-keyset 'election-admin-keyset))

  (defcap VOTED (candidateId:string)
    @managed
    true)

  ; ----------------------------------------------------------------------
  ; Functionality

  (defun vote (account:string candidateId:string)
    "Submit a new vote"
    ; Make sure the requester owns the KDA account
    (enforce-guard (at 'guard (coin.details account)))

    ; Do not allow multiple votes from the same account
    (let ((accounts (keys votes)))
      (enforce (= false (contains account accounts)) "Multiple voting not allowed"))

    ; Make sure the vote is for an existing candidate
    (let ((candidatesIds (keys candidates)))
      (enforce (contains candidateId candidatesIds) "Candidate doesn't exist"))

    (with-read candidates candidateId { "votes" := votesCount }
      (update candidates candidateId { "votes": (+ votesCount 1) })
      (insert votes account { "candidate": candidateId })
      (emit-event (VOTED candidateId))
    )
    (format "Voted for candidate {}!" [candidateId])
  )

  (defun getVotes:integer (candidateId:string)
    "Get the votes count by key"
    (at 'votes (read candidates candidateId ['votes]))
  )

  (defun getCandidates ()
    "Get all candidates"
    (map (getCandidate) (keys candidates))
  )

  (defun getCandidate (id:string)
    "Get candidate by id"
    (read candidates id ['name 'votes])
  )

  (defun init ()
    "Initialize the rows in votes table"
    (insert candidates "1" { "name": "Candidate A", "votes": 0 })
    (insert candidates "2" { "name": "Candidate B", "votes": 0 })
    (insert candidates "3" { "name": "Candidate C", "votes": 0 })
  )
)

(if (read-msg "upgrade")
  ["upgrade"]
  [
    (create-table candidates)
    (create-table votes)
    (init)
  ]
)
