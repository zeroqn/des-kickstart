pragma solidity 0.4.15;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";

/**
 * @title FactoryUtils
 * @dev   FactoryUtils provides common useful factory functions and
 * modifiers that can be used by other contracts.
 */

contract FactoryUtils is Ownable {

    mapping (address => bool) public factories;

    modifier onlyFactory() {
        require(factories[msg.sender]);
        _;
    }

    function setFactories(address[] _factories, bool[] _values)
        onlyOwner
        external
    {
        for (uint i = 0; i < _factories.length; i++) {
            factories[_factories[i]] = _values[i];
        }
    }

}
