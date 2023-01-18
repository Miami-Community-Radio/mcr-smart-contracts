pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";

import "@openzeppelin/contracts@4.8.1/utils/Strings.sol";
import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";

import "CompatibleInterface.sol";

contract MCRERC1155 is ERC1155, Ownable, ERC1155Burnable, ERC1155Supply, CompatibleInterface {
    //3months season timing
    uint256 public currentDate = block.timestamp;
    uint256 public lastMintDate;
    uint256 public timeTillExpire = 90 days;
    uint256 public expireDate = lastMintDate + timeTillExpire;
    uint256 public currentSeason;
    uint public teamTokenId = 0;
    uint public residentTokenId = 1;
    uint public commemorativeTokenId = 2;

    uint256 public residentTokensInCirculation; //dynamic, every 3 months, autoburn, non transferable - max supply 50, airdrop
    uint256 public commemorativeTokensInCirculation; //alumni - commerative nft - airdrop , transferable 
    uint256 public  teamTokensInCirculation; //team token - non transferable - no limit

    /**
     * @param _uri NFT metadata URI
     */
    constructor(string memory _uri) payable ERC1155("") {
        residentTokensInCirculation = 0;
        commemorativeTokensInCirculation = 0;
        teamTokensInCirculation = 0;
        currentSeason = 1;
    }

    //contract metadata
    function contractURI() public view returns (string memory) {
        return "https://ipfs.io/ipfs/QmY6etG5gm7iocUz7ZmMWbqFEMPixBzFu4irgSTSAYuFMW?filename=MCRERC1155.json";
    }

    //token metadata
    function uri(uint256 _tokenId) override public view returns (string memory){
        string memory residentUri = string.concat("https://ipfs.io/ipfs/QmWYT5V11ahBwJtNjMybDzdcgTr2RGxWeGaWCNZa892Jfi?filename=S",Strings.toString(currentSeason),".json");
        string memory commemorativeUri = string.concat("https://ipfs.io/ipfs/QmUkXi5hpP9sDui5AVGoXL5gKgkWKXpGgySrirkaSXiZNr?filename=S",Strings.toString(currentSeason - 1),".json");
        if(_tokenId == 0){//team
            return string(abi.encodePacked("https://ipfs.io/ipfs/QmNn2oZTnyRrNDDyHSpqUckjgPkmpFmUiRcX13ouAgqU3b?filename=team.json"));//team.json
        }else if(_tokenId == 1){//resident
            return string(abi.encodePacked(residentUri));
        }else if (_tokenId == 2){//commemorative
            return string(abi.encodePacked(commemorativeUri));
        }
    }

     /**
     * @dev Updates the base URI that will be used to retrieve metadata.
     * @param newuri The base URI to be used.
     */
    function setURI(string memory newuri) external onlyOwner {
        _setURI(newuri);
    }


    function mintTeamTokens(
        address account,
        uint256 amount,
        bytes memory data
    ) public onlyOwner {
        _mint(account, teamTokenId, amount, data);
        teamTokensInCirculation = teamTokensInCirculation + amount;
    }

    function mintCommemorativeTokens(
        address account,
        uint256 amount,
        bytes memory data
    ) external onlyOwner {
        if(currentSeason > 1){
            _mint(account, commemorativeTokenId, amount, data);
            commemorativeTokensInCirculation = commemorativeTokensInCirculation + amount;
        }
    }

    /*season and resident token minting function */
    function mintSeason(
        address account,
        uint256 amount,
        bytes memory data
    ) external onlyOwner {
        if(amount < 51){//50 resident cap
            if(block.timestamp > expireDate){//check if last season passed and nfts were burnt
                _mint(account, residentTokenId, amount, data);
                
                residentTokensInCirculation = residentTokensInCirculation + amount;
                
                lastMintDate = block.timestamp;//set mint date
            }
        }
    }

    //check if it has passed expiration and burn resident tokens
    function checkUpkeep(bytes memory)
        public override
        returns (bool needsUpkeep, bytes memory)
    {
        bool timePassed = (expireDate <= currentDate);
        needsUpkeep = (timePassed);
    }

    // //burns token once condition is met
    function performUpkeep(bytes calldata) external override {
        (bool needsUpkeep, ) = checkUpkeep("");
        require(needsUpkeep == true, "Upkeep not needed.");
        _burn(msg.sender, residentTokenId, 50);//check if this burns all tokens?
        residentTokensInCirculation = 0;//reset resident tokens
    }

    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal override(ERC1155, ERC1155Supply) {
        
        for(uint i=0; i < ids.length; i++){//resident and team token only transferable by owner
            if(ids[i] == residentTokenId || ids[i] == teamTokenId){
                require(msg.sender == owner(), "Not allowed to transfer token");
            }
        }
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }

    
}
