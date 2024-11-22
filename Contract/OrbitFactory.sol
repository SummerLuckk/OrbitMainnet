// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./OrbitWallet.sol";


contract OrbitWalletFactory {
    // Mapping to store OrbitWallet addresses for each user
    mapping(address => address[]) public userWallets;

    // Array to store all created OrbitWallet addresses
    address[] public allWallets;
    address public feeReceiver;
    uint256 public minFee;
    address public owner;

    // Event emitted when a new OrbitWallet is created
    event WalletCreated(
        address indexed wallet,
        address[] owners,
        uint256 numConfirmationsRequired
    );

      // Modifier to restrict access to only the owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action.");
        _;
    }

     constructor(
       address _owner,
       address  _feeReceiver,
       uint256 _minFee
    )
    {
        owner=_owner;
        feeReceiver =_feeReceiver;
        minFee =_minFee;
    }

     // Function to modify the feeReceiver address
    function setFeeReceiver(address _feeReceiver) external onlyOwner {
        require(_feeReceiver != address(0), "Invalid address");
        feeReceiver = _feeReceiver;
    }

    // Function to modify the minFee value
    function setMinFee(uint256 _minFee) external onlyOwner {
        require(_minFee > 0, "Minimum fee must be greater than 0");
        minFee = _minFee;
    }

    // Function to modify the owner address
    function setOwner(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Invalid address");
        require(_newOwner != owner, "New owner address must be different");
        owner = _newOwner;
    }

    /**
     * @dev Creates a new OrbitWallet instance
     * @param _owners An array of addresses representing the initial wallet owners
     * @param _numConfirmationsRequired The minimum number of owner confirmations required for transaction execution
     * @return The address of the newly created OrbitWallet
     */
    function createWallet(
        address[] memory _owners,
        uint256 _numConfirmationsRequired
    ) public payable returns (address) {
        // Check that the fee sent with the transaction matches the minFee
        require(msg.value == minFee, "Incorrect fee amount sent");

        // Transfer the fee to the feeReceiver
        payable(feeReceiver).transfer(msg.value);

        // Create a new wallet
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

        // Emit the WalletCreated event
        emit WalletCreated(walletAddress, _owners, _numConfirmationsRequired);

        // Return the new wallet's address
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



    // Withdraw ERC20 tokens mistakenly sent to the contract

    function withdrawERC20(address tokenAddress, uint256 amount) external onlyOwner {
        require(tokenAddress != address(0), "Invalid token address");
        IERC20 token = IERC20(tokenAddress);

        uint256 contractBalance = token.balanceOf(address(this));
        require(amount <= contractBalance, "Insufficient contract balance");

        // Transfer the tokens to the owner's address
        require(token.transfer(owner, amount), "Token transfer failed");
    }
}