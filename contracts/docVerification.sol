// SPDX-License-Identifier: MIT
pragma solidity ^ 0.8;

contract DocVerification {

  // Logbook for hosted documents

  struct DocumentData {
    bytes32 sign;
    bytes32 recordHash;
    string authorName;
    string title;
    string email;
    uint timestamp;
    bool isDocExists;
  }

  // Step 1: The researcher will use the DApp to hash details enclosed in DocumentData and sign it using Metamask

  // Step 2: Dapp interacts with this smart contract to store the digital signature and map it with DocumentData

  mapping(bytes32 => DocumentData) public documentdata;


  event _NewDocAdd(bytes32 indexed recordHash, string authorName, string title, string email, uint256 timestamp, bool isDocExists);

  function addNewDoc(bytes32 _sign, bytes32 _recordHash, string memory _authorName, string memory _title, string memory _email) public {

    documentdata[_recordHash].recordHash = _recordHash;
    documentdata[_recordHash].sign = _sign;
    documentdata[_recordHash].authorName  = _authorName;
    documentdata[_recordHash].title  = _title;
    documentdata[_recordHash].email  = _email;
    documentdata[_recordHash].timestamp  = block.timestamp;
    documentdata[_recordHash].isDocExists  = true;

    emit _NewDocAdd(_recordHash, _authorName, _title, _email, block.timestamp, true);

  }

  function exists(bytes32 _record) view public returns(bool) {
    return documentdata[_record].isDocExists;
  }

  function getDocDetailsFromHash(bytes32 _recordHash) view public returns ( string memory ,string memory ,string memory, uint256) {
    return ( documentdata[_recordHash].authorName , documentdata[_recordHash].title, documentdata[_recordHash].email, documentdata[_recordHash].timestamp );
  }

  // Step 3: Peers can call VerifyMessage and check whether the signature is valid

  function VerifyMessage(bytes32 _hashedMessage, uint8 _v, bytes32 _r, bytes32 _s) public pure returns (address) {
        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        bytes32 prefixedHashMessage = keccak256(abi.encodePacked(prefix, _hashedMessage));
        address signer = ecrecover(prefixedHashMessage, _v, _r, _s);
        return signer;
    }

}
