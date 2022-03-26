(define-keyset 'election-admin-keyset)

(namespace "free")

(module election GOVERNANCE
  "Election demo module"

  (use coin [ details ])

  ; ----------------------------------------------------------------------
  ; Schema

  (defschema candidates-schema
    "Candidates table schema"
    name:string
    votes:integer)

  (defschema votes-schema
    "Votes table schema"
    cid:string
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

  (defcap ACCOUNT-OWNER (account:string)
    "Make sure the requester owns the KDA account"
    (enforce-guard (at 'guard (coin.details account)))
  )

  (defcap VOTED (candidateId:string)
    @managed
    true)

  ; ----------------------------------------------------------------------
  ; Functionality

  (defun vote-protected (account:string candidateId:string)
    (require-capability (ACCOUNT-OWNER account))

    (with-read candidates candidateId { "votes" := votesCount }
      (update candidates candidateId { "votes": (+ votesCount 1) })
      (insert votes account { "cid": candidateId })
      (emit-event (VOTED candidateId))
    )
  )

  (defun user-voted:bool (account:string)
    (with-default-read votes account
      { "cid": "" }
      { "cid":= cid }
      (> (length cid) 0))
  )

  (defun candidate-exists:bool (cid:string)
    (with-default-read candidates cid
      { "name": "" }
      { "name" := name }
      (> (length name) 0))
  )

  (defun vote (account:string cid:string)
    "Submit a new vote"

    (let ((doubleVote (user-voted account)))
      (enforce (= doubleVote false) "Multiple voting not allowed"))

    (let ((exists (candidate-exists cid)))
      (enforce (= exists true) "Candidate doesn't exist"))

    (with-capability (ACCOUNT-OWNER account)
      (vote-protected account cid))

    (format "Voted for candidate {}!" [cid])
  )

  (defun getVotes:integer (cid:string)
    "Get the votes count by cid"
    (at 'votes (read candidates cid ['votes]))
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
