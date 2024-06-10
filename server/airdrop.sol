// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {MerkleProof} from "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/cryptography/MerkleProof.sol";

abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }
}

abstract contract Ownable is Context {
    address private _owner;
    address private creator;
    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    constructor() {
        _transferOwnership(_msgSender());
    }

    function owner() public view virtual returns (address) {
        return _owner;
    }

    modifier onlyOwner() {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
        _;
    }

    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(
            newOwner != address(0),
            "Ownable: new owner is the zero address"
        );
        _transferOwnership(newOwner);
    }

    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}

interface IERC20 {
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 value) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

interface IERC165 {
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}

interface IERC1155 is IERC165 {
    event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value);
    event TransferBatch(
        address indexed operator,
        address indexed from,
        address indexed to,
        uint256[] ids,
        uint256[] values
    );
    event ApprovalForAll(address indexed account, address indexed operator, bool approved);
    event URI(string value, uint256 indexed id);

    function balanceOf(address account, uint256 id) external view returns (uint256);

    function balanceOfBatch(
        address[] calldata accounts,
        uint256[] calldata ids
    ) external view returns (uint256[] memory);

    function setApprovalForAll(address operator, bool approved) external;

    function isApprovedForAll(address account, address operator) external view returns (bool);

    function safeTransferFrom(address from, address to, uint256 id, uint256 value, bytes calldata data) external;

    function safeBatchTransferFrom(
        address from,
        address to,
        uint256[] calldata ids,
        uint256[] calldata values,
        bytes calldata data
    ) external;
}

contract AirdropClaimContract3 is Ownable{

    bytes32 public merkleRoot;
    IERC20 public erc20Token;
    IERC1155 public erc1155Token;
    uint public baseAmount;
    uint256 public claimPeriodStart; // Timestamp when the claim period starts
    uint256 public claimPeriodEnd;   // Timestamp when the claim period ends

    mapping(address => bool) public isClaimed;
    mapping(address => uint) public claimedAmount;

    event TokensClaimed(address indexed recipient, uint256 amount, uint256 erc1155Balance);

    constructor(bytes32 _merkleRoot,
        address _erc20Token,
        address _erc1155Token,
        uint _baseAmount,
        uint256 _claimPeriodStart,
        uint256 _claimPeriodEnd
    ) {
        merkleRoot = _merkleRoot;
        erc20Token = IERC20(_erc20Token);
        erc1155Token = IERC1155(_erc1155Token);
        baseAmount = _baseAmount;
        claimPeriodStart = _claimPeriodStart;
        claimPeriodEnd = _claimPeriodEnd;
    }

    function claim(bytes32[] memory proof) public {
        require(!isClaimed[msg.sender], "You have already claimed tokens");

        bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
        
        require(MerkleProof.verify(proof, merkleRoot, leaf), "Invalid proof");

        uint256 erc1155Balance = erc1155Token.balanceOf(msg.sender, 1);
        uint amountToClaim = erc1155Balance * baseAmount;

        if (amountToClaim == 0) {
            require(claimedAmount[msg.sender] + baseAmount <= erc20Token.balanceOf(address(this)), "Contract has insufficient balance to fulfill claim");
            claimedAmount[msg.sender] += baseAmount;
            require(erc20Token.transfer(msg.sender, baseAmount), "Transfer failed");
        } else {
            require(claimedAmount[msg.sender] + amountToClaim <= erc20Token.balanceOf(address(this)), "Contract has insufficient balance to fulfill claim");
            claimedAmount[msg.sender] += amountToClaim;
            require(erc20Token.transfer(msg.sender, amountToClaim), "Transfer failed");
        }

        isClaimed[msg.sender] = true;

        emit TokensClaimed(msg.sender, amountToClaim, erc1155Balance);
    }

    function updateMerkleRoot(bytes32 _newMerkleRoot) external onlyOwner {
        merkleRoot = _newMerkleRoot;
    }

    function withdraw(uint256 _amount) public onlyOwner {
        require(erc20Token.transfer(msg.sender, _amount), "withdraw failed");
    }

    function setBaseAmount(uint _newBaseAmount) public onlyOwner {
        baseAmount = _newBaseAmount;
    }

    function getBalance() public view returns (uint256) {

        return erc20Token.balanceOf(address(this));
    }

    receive() external payable {}
}