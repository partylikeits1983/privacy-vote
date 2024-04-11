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
import {
  getVoteData,
  authenticateUser,
  generateProof,
} from '../utils/webAuthn';
import {} from '@web3modal/ethers/react';

import {
  useWeb3ModalAccount,
  useWeb3ModalProvider,
} from '@web3modal/ethers/react';
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
    fetchVoteData();
  }, [walletProvider]);

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

  const fetchVoteData = async () => {
    try {
      const proposalId = 0;
      const data = await getVoteData(walletProvider, proposalId);
      setVoteData(data);
    } catch (error) {
      console.error('Failed to fetch vote data:', error);
    }
  };

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
        // If the pushVoteData finishes after the timer, consider it as unsuccessful.
        setSubmissionMessage('Proof generation timed out');
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
