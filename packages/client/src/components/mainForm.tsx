import React from 'react';
import { Input, Button, Text, VStack, Heading } from '@chakra-ui/react';
import { registerWithWebAuthn, loginWithWebAuthn } from '../utils/webAuthn';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface MainFormProps {
  username: string;
  setUsername: (username: string) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  isAuthenticated: boolean;
  isRoaming: boolean;
  walletProvider?: any;
}

const MainForm: React.FC<MainFormProps> = ({
  username,
  setUsername,
  setIsAuthenticated,
  isAuthenticated,
  isRoaming,
  walletProvider,
}) => {
  return (
    <VStack spacing={4}>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />{' '}
      <Heading size="lg" color="white">
        Privacy Vote with WebAuthn
      </Heading>
      {!isAuthenticated ? (
        <>
          <Input
            placeholder="Enter Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            size="md"
            color="white"
          />
          <Button
            colorScheme="blue"
            onClick={() =>
              registerWithWebAuthn(username, isRoaming, setIsAuthenticated)
            }
          >
            Register to Vote
          </Button>
        </>
      ) : (
        <Text color="white">Logged in as {username}</Text>
      )}
      {isAuthenticated && (
        <Button
          colorScheme="green"
          onClick={() =>
            loginWithWebAuthn(username, isRoaming, setIsAuthenticated)
          }
        >
          Request KYC
        </Button>
      )}
      {isAuthenticated && <Text color="white">User is authenticated</Text>}
    </VStack>
  );
};

export default MainForm;
