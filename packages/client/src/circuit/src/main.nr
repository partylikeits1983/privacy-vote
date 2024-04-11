use dep::std::hash::poseidon;

fn main(
    root: pub Field,
    nulifierHash: pub Field,
    proofSiblings: [Field; 32],
    proofPathIndices: [Field; 32],
    nulifier: Field,
    secret: Field,
    proposalId: pub Field,
    voteType: pub Field
) {
    let leaf = poseidon::bn254::hash_2([nulifier, secret]);

    // using proposalId in hash to prevent privacy leak on multiple votes
    assert(nulifierHash == poseidon::bn254::hash_2([nulifier, proposalId]));

    let mut hash: Field = leaf;

    for i in 0..32 {
        if proofPathIndices[i] == 0 {
            let input: [Field; 2] = [hash, proofSiblings[i]];
            hash 
            = poseidon::bn254::hash_2(input);
        } else {
            let input: [Field; 2] = [proofSiblings[i], hash];
            hash = poseidon::bn254::hash_2(input);
        }
    }
    assert(hash == root);
}

/*  fn main(x : Field, y : pub Field) {
    assert(x != y);
}
  */
