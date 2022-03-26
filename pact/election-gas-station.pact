(namespace "free")

(module election-gas-station GOVERNANCE
  (defcap GOVERNANCE ()
    "Only admin account can update the smart contract"
    (enforce-keyset 'election-admin-keyset))

  (implements gas-payer-v1)
  (use coin)

  (defconst GAS_STATION "election-gas-station")

  (defun chain-gas-price ()
    "Return gas price from chain-data"
    (at 'gas-price (chain-data)))

  (defun enforce-below-or-at-gas-price:bool (gasPrice:decimal)
    (enforce (<= (chain-gas-price) gasPrice)
      (format "Gas Price must be smaller than or equal to {}" [gasPrice])))

  (defcap GAS_PAYER:bool
    ( user:string
      limit:integer
      price:decimal
    )
    (enforce (= "exec" (at "tx-type" (read-msg))) "Inside an exec")
    (enforce (= 1 (length (at "exec-code" (read-msg)))) "Tx of only one pact function")
    (enforce (= "(free.election." (take 15 (at 0 (at "exec-code" (read-msg))))) "Only election module calls allowed")
    (enforce-below-or-at-gas-price 0.000001)
    (compose-capability (ALLOW_GAS))
  )

  (defcap ALLOW_GAS () true)

  (defun create-gas-payer-guard:guard ()
    (create-user-guard (gas-payer-guard))
  )

  (defun gas-payer-guard ()
    (require-capability (GAS))
    (require-capability (ALLOW_GAS))
  )

  (defun init ()
    (coin.create-account GAS_STATION (create-gas-payer-guard))
  )
)

(if (read-msg 'upgrade)
  ["upgrade"]
  [
    (init)
  ]
)
