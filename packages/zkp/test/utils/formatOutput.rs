use std::fs::File;
use std::io::{self, BufRead, Write};
use std::path::Path;

fn main() -> io::Result<()> {
    let root_path = Path::new("data/root.txt");
    let commitmenthash_path = Path::new("data/commitmentHash.txt");
    let nulifierhash_path = Path::new("data/nulifierHash.txt");
    let siblings_path = Path::new("data/proofSiblings.txt");
    let indices_path = Path::new("data/proofPathIndices.txt");
    let nulifier_path = Path::new("data/nulifier.txt");
    let secret_path = Path::new("data/secret.txt");
    let proposalid_path = Path::new("data/proposalId.txt");
    let votetype_path = Path::new("data/voteType.txt");

    // Edit to have two Prover.toml files
    // circuits/deposit/Prover.toml needs nulifier, secret, poolKey, liquidity
    // circuits/withdraw/Prover.toml needs everything
    let output_path = Path::new("circuits/Prover.toml");
    let mut output_path = File::create(&output_path)?;

    // Initialize variables for leaf and root values
    let commitmenthash_value = read_first_line(&commitmenthash_path)?;
    let nulifierhash_value = read_first_line(&nulifierhash_path)?;
    let root_value = read_first_line(&root_path)?;
    let nulifier_value = read_first_line(&nulifier_path)?;
    let secret_value = read_first_line(&secret_path)?;
    let proposalid_value = read_first_line(&proposalid_path)?;
    let votetype_value = read_first_line(&votetype_path)?;

    // circuits/Prover.toml
    writeln!(output_path, "commitmentHash = \"{}\"", commitmenthash_value)?;
    writeln!(output_path, "nulifierHash = \"{}\"", nulifierhash_value)?;
    writeln!(output_path, "root = \"{}\"", root_value)?; 
    writeln!(output_path, "nulifier = \"{}\"", nulifier_value)?;  
    writeln!(output_path, "secret = \"{}\"", secret_value)?;  
    writeln!(output_path, "proposalId = \"{}\"", proposalid_value)?;
    writeln!(output_path, "voteType = \"{}\"", votetype_value)?;
    
    writeln!(output_path, "proofSiblings = [")?;
    for line in io::BufReader::new(File::open(&siblings_path)?).lines() {
        let line = line?; // Handle potential errors in line reading
        writeln!(output_path, "    \"{}\",", line)?;
    }
    writeln!(output_path, "]\n")?; // Add a newline for readability

    // Write proofPathIndices array
    writeln!(output_path, "proofPathIndices = [")?;
    for line in io::BufReader::new(File::open(&indices_path)?).lines() {
        let line = line?; // Handle potential errors in line reading
        writeln!(output_path, "    {},", line)?;
    }
    writeln!(output_path, "]")?;

    Ok(())
}

// Helper function to read the first line from a file
fn read_first_line(path: &Path) -> io::Result<String> {
    let file = File::open(path)?;
    let mut buf_reader = io::BufReader::new(file);
    let mut line = String::new();
    // Only read the first line
    buf_reader.read_line(&mut line)?;
    // Trim the newline character(s) at the end of the line
    Ok(line.trim_end().to_string())
}
