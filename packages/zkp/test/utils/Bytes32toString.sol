pragma solidity ^0.8.0;

contract ConvertBytes32ToString {
    function bytes32ToString(bytes32 _bytes32) public pure returns (string memory) {
        // Create a buffer of 64 bytes (2 characters per byte)
        bytes memory bytesArray = new bytes(64);
        for (uint256 i = 0; i < 32; i++) {
            // Convert each byte to uint8 to perform arithmetic operations
            uint8 byteValue = uint8(_bytes32[i]);
            // Determine the hexadecimal character for the high nibble
            bytesArray[i * 2] = byteToHexChar(byteValue / 16);
            // Determine the hexadecimal character for the low nibble
            bytesArray[1 + i * 2] = byteToHexChar(byteValue % 16);
        }
        // Prefix with "0x" and return the resulting string
        return string(abi.encodePacked("0x", string(bytesArray)));
    }

    function byteToHexChar(uint8 b) internal pure returns (bytes1) {
        // If byte is less than 10, return corresponding ASCII character for digits
        if (b < 10) {
            return bytes1(b + 48); // ASCII '0' = 48
        }
        // Otherwise, return ASCII character for a-f by adjusting with ASCII 'a' = 97 minus 10
        return bytes1(b + 87); // ASCII 'a' - 10 = 87
    }
}
