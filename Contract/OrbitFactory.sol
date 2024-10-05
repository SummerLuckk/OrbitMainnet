// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./OrbitWallet.sol";

contract OrbitWalletFactory {
    // Mapping to store OrbitWallet addresses for each user
    mapping(address => address[]) public userWallets;

    // Array to store all created OrbitWallet addresses
    address[] public allWallets;

    // Event emitted when a new OrbitWallet is created
    event WalletCreated(
        address indexed wallet,
        address[] owners,
        uint256 numConfirmationsRequired
    );

    /**
     * @dev Creates a new OrbitWallet instance
     * @param _owners An array of addresses representing the initial wallet owners
     * @param _numConfirmationsRequired The minimum number of owner confirmations required for transaction execution
     * @return The address of the newly created OrbitWallet
     */
    function createWallet(
        address[] memory _owners,
        uint256 _numConfirmationsRequired
    ) public returns (address) {
        OrbitWallet newWallet = new OrbitWallet(
            _owners,
            _numConfirmationsRequired
        );
        address walletAddress = address(newWallet);

        // Add the new wallet to the list of all wallets
        allWallets.push(walletAddress);

        // Add the wallet to each owner's list of wallets
        for (uint256 i = 0; i < _owners.length; i++) {
            userWallets[_owners[i]].push(walletAddress);
        }

        emit WalletCreated(walletAddress, _owners, _numConfirmationsRequired);

        return walletAddress;
    }

    /**
     * @dev Retrieves all wallets associated with a user
     * @param _user The address of the user
     * @return An array of OrbitWallet addresses associated with the user
     */
    function getUserWallets(
        address _user
    ) public view returns (address[] memory) {
        return userWallets[_user];
    }

    /**
     * @dev Retrieves all created OrbitWallet addresses
     * @return An array of all OrbitWallet addresses
     */
    function getAllWallets() public view returns (address[] memory) {
        return allWallets;
    }
}
