// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract OrbitWallet is IERC165, EIP712, ReentrancyGuard {
    using ECDSA for bytes32;
    event Deposit(address indexed sender, uint256 amount, uint256 balance);
    event SubmitTransaction(
        address indexed owner,
        uint256 indexed txIndex,
        address indexed to,
        uint256 value,
        address tokenAddress
    );

    event ExecuteTransaction(address indexed owner, uint256 indexed txIndex);

    function supportsInterface(
        bytes4 interfaceId
    ) external pure override returns (bool) {
        return
            interfaceId == type(IERC165).interfaceId ||
            interfaceId == type(IERC721Receiver).interfaceId ||
            interfaceId == type(IERC1155Receiver).interfaceId;
    }

    bytes32 public constant SIGNER_TYPEHASH =
        keccak256(
            "signTransaction(address receiver,uint256 amount,address tokenAddress,bytes32 nonce,uint256 date)"
        );

    bytes32 private constant EXECUTE_TYPEHASH =
        keccak256(
            "Execute(address to,uint256 value,bytes data,uint256 nonce,uint256 deadline)"
        );

    /**
     * @dev Initializes the multi-signature wallet contract.
     * @param _owners An array of addresses representing the initial wallet owners.
     * @param _numConfirmationsRequired The minimum number of owner confirmations required for transaction execution.
     * @notice At least 2 owners are required to create the wallet.
     * @notice The threshold for confirmations should be set to 2 or more.
     * @notice Each owner must have a unique address, and zero addresses are not allowed.
     * @notice The number of required confirmations must be between 2 and the total number of owners.
     * @notice This function is called only once during contract deployment.
     */
    constructor(
        address[] memory _owners,
        uint256 _numConfirmationsRequired
    ) EIP712("OrbitWallet", "1") {
        uint256 ownerCount = _owners.length;
        require(ownerCount >= 2, "At least 2 owners required");
        require(
            _numConfirmationsRequired >= 2 &&
                _numConfirmationsRequired <= ownerCount,
            "Invalid threshold"
        );

        for (uint256 i = 0; i < ownerCount; ) {
            address owner = _owners[i];
            require(
                owner != address(0) && !isOwner[owner],
                "Invalid or duplicate owner"
            );

            isOwner[owner] = true;
            ++i;
        }

        owners = _owners;
        ownersCount = ownerCount;
        numConfirmationsRequired = _numConfirmationsRequired;
    }

    mapping(bytes32 => bool) internal _authorizationStates;

    modifier nonceNotUsed(bytes32 nonce) {
        require(_authorizationStates[nonce] == false, "Nonce already used");
        _;
    }

    function changeThreshold(uint256 _value) public onlyWallet {
        require(_value >= 2, "threshold can't be less than 2");
        require(
            _value <= ownersCount,
            "Threshold can't be more than Owners length"
        );
        numConfirmationsRequired = _value;
    }

    /// @notice Adds a new owner to the multi-signature wallet.
    /// @dev Only the wallet owner can call this function.
    /// @param _address The address of the new owner to be added.
    function addOwner(address _address) public onlyWallet {
        require(_address != address(0), "address can't be null");
        require(!isOwner[_address], "Owner already added");
        isOwner[_address] = true;
        owners.push(_address);
        ownersCount++;
    }

    /// @notice Adds a new owner to the multi-signature wallet with threshold.
    /// @dev Only the wallet owner can call this function.
    /// @param _address The address of the new owner to be added.
    function addOwnerWithThreshold(
        address _address,
        uint256 _value
    ) public onlyWallet {
        require(_value >= 2, "threshold can't be less than 2");
        require(
            _value <= ownersCount + 1,
            "Threshold can't be more than Owners length"
        );
        addOwner(_address);
        numConfirmationsRequired = _value;
    }

    function deleteOwner(address _address) public onlyWallet {
        require(_address != address(0), "Zero address not allowed");
        require(isOwner[_address], "Owner doesn't exist");
        require(ownersCount > 2, "Cannot delete the last two owner");
        require(numConfirmationsRequired > 2, "Threshold cannot go below 2");
        isOwner[_address] = false;
        numConfirmationsRequired--;
        ownersCount--;
    }

    // Array of all owners
    address[] public owners;
    uint256 public ownersCount;

    // Mapping to track whether an address is an owner of the wallet
    mapping(address => bool) public isOwner;

    // The number of confirmations required for executing certain operations in the wallet
    uint256 public numConfirmationsRequired;

    // Structure representing a transaction in the wallet
    struct Transaction {
        uint256 txIndex;
        address receiver;
        uint256 amount;
        address tokenAddress;
        bool executed;
        bytes32 nonce;
        uint256 date;
    }

    // Mapping indicating whether a transaction is confirmed, indexed by transaction index and owner
    mapping(uint256 => mapping(address => bool)) public isConfirmed;

    // Array storing transactions in the wallet
    Transaction[] public transactions;

    // Modifier: Only allows execution by owners of the wallet
    modifier onlyOwners() {
        require(isOwner[msg.sender], "not owner");
        _;
    }

    // Modifier: Only allows execution by the wallet itself
    modifier onlyWallet() {
        require(msg.sender == address(this), "not Wallet");
        _;
    }

    // Modifier: Ensures the specified transaction index exists
    modifier txExists(uint256 _txIndex) {
        require(_txIndex <= transactions.length, "tx does not exist");
        _;
    }

    // Modifier: Ensures the specified transaction has not been executed
    modifier notExecuted(uint256 _txIndex) {
        require(!transactions[_txIndex].executed, "tx already executed");
        _;
    }

    /// @notice Default receive function that allows the contract to accept incoming Ether
    receive() external payable {
        emit Deposit(msg.sender, msg.value, address(this).balance);
    }

    /// @notice Fallback function to handle Ether sent to the contract without a specific function call
    fallback() external payable {
        emit Deposit(msg.sender, msg.value, address(this).balance);
    }

    function submitTransaction(
        address _to,
        uint256 _value,
        address _tokenAddress,
        bytes32  _nonce,
        uint256 _scheduledData
    ) public onlyOwners {
        require(_to != address(0), "Can't submit to Zero address");
        uint256 txIndex = transactions.length;

        transactions.push(
            Transaction({
                txIndex: txIndex,
                receiver: _to,
                amount: _value,
                tokenAddress: _tokenAddress,
                executed: false,
                nonce: _nonce,
                date: _scheduledData
            })
        );

        emit SubmitTransaction(msg.sender, txIndex, _to, _value, _tokenAddress);
    }

    function executeTransaction(
        address to,
        uint256 value,
        bytes memory data,
        uint256 deadline,
        bytes32 nonce,
        bytes[] memory signatures
    ) public nonReentrant nonceNotUsed(nonce) returns (bool success) {
        require(block.timestamp <= deadline, "Transaction expired");

        bytes32 txHash = keccak256(
            abi.encode(
                EXECUTE_TYPEHASH,
                to,
                value,
                keccak256(data),
                nonce,
                deadline
            )
        );
        bytes32 hash = _hashTypedDataV4(txHash);

        // Verify signatures
        verifySignatures(hash, signatures);

        // Execute the transaction
        (success, ) = to.call{value: value}(data);

        require(success, "Failed to execute");
    }

    /**
     * @dev Executes a confirmed transaction.
     * @param _txIndex The index of the transaction to execute.
     * @notice This function can only be called by wallet owners.
     * @notice The transaction must exist, must not have been executed, and must have the required number of confirmations.
     */
    function executeScheduledTransaction(
        uint256 _txIndex,
        bytes[] memory memberSignatures
    ) public onlyOwners txExists(_txIndex) notExecuted(_txIndex) {
        Transaction storage transaction = transactions[_txIndex];

        require(
            transaction.date >= block.timestamp,
            "Cannot Execute before the Scheduled Date"
        );

        bytes32 structHash = keccak256(
            abi.encode(
                SIGNER_TYPEHASH,
                transaction.receiver,
                transaction.amount,
                transaction.tokenAddress,
                transaction.nonce,
                transaction.date
            )
        );

        bytes32 hash = _hashTypedDataV4(structHash);

        verifySignatures(hash, memberSignatures);

        if (
            transaction.tokenAddress ==
            0x0000000000000000000000000000000000000000
        ) {
            // Native token transfer
            (bool success, ) = transaction.receiver.call{
                value: transaction.amount
            }("");
            require(success, "Transaction execution failed");
        } else {
            // ERC20 token transfer
            IERC20 token = IERC20(transaction.tokenAddress);
            bool success = token.transfer(
                transaction.receiver,
                transaction.amount
            );
            require(success, "ERC20 transfer failed");
        }
        transaction.executed = true;

        emit ExecuteTransaction(msg.sender, _txIndex);
    }

    function verifySignatures(
        bytes32 hash,
        bytes[] memory _signatures
    ) internal view {
        address[] memory signers = new address[](_signatures.length);
        for (uint256 i = 0; i < _signatures.length; i++) {
            signers[i] = ECDSA.recover(hash, _signatures[i]);
            require(isOwner[signers[i]], "Not a member of Wallet");
        }

        uint256 uniqueSigners = 0;
        for (uint256 i = 0; i < signers.length; i++) {
            bool isDuplicate = false;
            for (uint256 j = 0; j < uniqueSigners; j++) {
                if (signers[i] == signers[j]) {
                    isDuplicate = true;
                    break;
                }
            }
            if (!isDuplicate) {
                uniqueSigners++;
            }
        }
        require(
            uniqueSigners >= numConfirmationsRequired,
            "Not enough unique signatures"
        );
    }

    /**
     * @dev Retrieves the addresses of all active wallet owners.
     * @return result An array containing the addresses of the wallet owners.
     * @notice Only active owners are included in the result; inactive owners are ignored.
     */
    function getOwners() public view returns (address[] memory) {
        address[] memory result = new address[](ownersCount);
        uint256 index = 0;
        for (uint256 i = 0; i < owners.length; i++) {
            if (isOwner[owners[i]]) {
                result[index] = owners[i];
                index++;
            }
        }

        return result;
    }

    /**
     * @dev Withdraws a specified amount of funds from the wallet to a specified address.
     * @param _amount The amount of funds to withdraw.
     * @param _address The address to which the funds will be transferred.
     * @notice This function can only be called by the wallet itself.
     * @notice The function checks if the wallet has sufficient funds for the specified amount before initiating the transfer.
     */
    function withdraw(
        uint256 _amount,
        address payable _address
    ) public onlyWallet nonReentrant {
        require(address(this).balance >= _amount, "Insufficient funds");
        (bool sent, ) = _address.call{value: _amount}("");
        require(sent, "Failed to send Ether");
    }

    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function getTransaction(
        uint256 _txIndex
    ) public view returns (Transaction memory) {
        Transaction storage transaction = transactions[_txIndex];
        return (transaction);
    }

    function getAllTransactions() public view returns (Transaction[] memory) {
        return transactions;
    }
}