import React, { useState, useEffect } from 'react';
import {
  Button,
  Text,
  VStack,
  Heading,
  Box,
  Stack,
  Select,
  CircularProgress,
} from '@chakra-ui/react';

import { ethers, BrowserProvider } from 'ethers';
import {
  getVoteData,
  authenticateUser,
  generateProof,
} from '../utils/webAuthn';
import {} from '@web3modal/ethers/react';
import { toast } from 'react-toastify';

import { useWeb3ModalProvider } from '@web3modal/ethers/react';

const ZK_KYCABI = require('../abi/ZK_KYC.json').abi;
const WebAuthnAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';

interface VoteFormProps {
  username: string;
}
const VoteForm: React.FC<VoteFormProps> = ({ username }) => {
  const { walletProvider } = useWeb3ModalProvider();

  // State to hold vote data and user's vote choice
  const [voteData, setVoteData] = useState<any>(null);
  const [voteChoice, setVoteChoice] = useState<string>('');

  // States for submission progress and success message
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionMessage, setSubmissionMessage] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(0);

  // Fetch vote data when component mounts
  useEffect(() => {
    const fetchVoteData = async () => {
      try {
        // Example: Fetching initial vote data
        const proposalId = 0; // Example proposal ID
        const data = await getVoteData(walletProvider, proposalId);
        setVoteData(data);

        // Set up a listener for the ProposalVoted event if the walletProvider is available
        if (walletProvider) {
          const ethersProvider = new BrowserProvider(walletProvider);
          const signer = await ethersProvider.getSigner();

          const zkKYC = new ethers.Contract(WebAuthnAddress, ZK_KYCABI, signer);

          const onVote = (proposalId: bigint, voteType: bigint) => {
            console.log(
              `New vote for proposalId: ${proposalId} with voteType: ${voteType}`,
            );

            // Use an IIFE (Immediately Invoked Function Expression) to handle async operations
            (async () => {
              try {
                // This ensures that you are within an async context and can use await
                const data = await getVoteData(
                  walletProvider,
                  Number(proposalId),
                );
                setVoteData(data); // Update your component's state with the new vote data
              } catch (error) {
                console.error('Failed to fetch vote data:', error);
              }
            })();
          };

          // Listen for the ProposalVoted event
          zkKYC.on('ProposalVoted', onVote);

          // Clean up the listener when the component unmounts or the walletProvider changes
          return () => {
            zkKYC.off('ProposalVoted', onVote);
          };
        }
      } catch (error) {
        console.error('Failed to fetch vote data:', error);
      }
    };

    fetchVoteData();
  }, [walletProvider]); // Dependency array includes walletProvider

  useEffect(() => {
    // Declare 'timer' with a type that is suitable for both browser and Node.js environments.
    let timer: ReturnType<typeof setTimeout>;

    if (isSubmitting && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    }

    // The cleanup function to clear the timeout
    return () => clearTimeout(timer);
  }, [isSubmitting, countdown]);

  const submitVote = async () => {
    setSubmissionMessage(''); // Clear any previous messages

    // Wait for the authentication result and proceed only if it returns true
    const isAuthenticated = await authenticateUser(username);
    if (!isAuthenticated) {
      setSubmissionMessage('Enter username');
      setIsSubmitting(false); // Update the submission state to false as the process halts here
      return; // Exit the function early since the user is not authenticated
    }

    try {
      setIsSubmitting(true);
      setCountdown(160); // Start the countdown from 2 minutes and 40 seconds

      const proposalId = 0;
      const voteType = voteChoice === 'for' ? 1 : 0;

      const pushPromise = generateProof(
        walletProvider,
        username,
        proposalId,
        voteType,
      );
      const timerPromise = new Promise((resolve) =>
        setTimeout(resolve, 150000),
      ); // 2 minutes and 30 seconds

      const result = await Promise.race([pushPromise, timerPromise]);

      if (result) {
        setSubmissionMessage('Proof generation success');
      } else {
        toast.error('Please hold on, proof generation in');
        setCountdown(45);
        setSubmissionMessage('proof generation is taking longer than expected');
      }
    } catch (error) {
      console.error('Failed to submit vote:', error);
      setSubmissionMessage('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCountdown = () => {
    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <VStack spacing={4}>
      <Heading size="lg" color="white">
        Vote
      </Heading>

      {voteData && (
        <Box padding="4" bg="gray.700" borderRadius="md">
          <Stack spacing={3}>
            <Text color="white">Description: {voteData[0]}</Text>
            <Text color="white">Vote Count: {voteData[1]}</Text>
            <Text color="white">Votes For: {voteData[2]}</Text>
            <Text color="white">Votes Against: {voteData[3]}</Text>
            <Text color="white">
              Created At: {new Date(voteData[4] * 1000).toLocaleString()}
            </Text>
            <Text color="white">Is Accepted: {voteData[5] ? 'Yes' : 'No'}</Text>
            <Text color="white">Data: {voteData[6]}</Text>
            <Select
              placeholder="Select option"
              color="black"
              onChange={(e) => setVoteChoice(e.target.value)}
            >
              <option value="for">For</option>
              <option value="against">Against</option>
            </Select>
          </Stack>
        </Box>
      )}

      <Button colorScheme="blue" onClick={submitVote} isDisabled={isSubmitting}>
        Submit Vote
      </Button>
      {isSubmitting && (
        <>
          <CircularProgress isIndeterminate color="blue.300" />
          <Text color="white">{formatCountdown()}</Text>
        </>
      )}
      {submissionMessage && <Text color="green.500">{submissionMessage}</Text>}
    </VStack>
  );
};

export default VoteForm;
