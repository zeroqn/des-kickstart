pragma solidity 0.4.15;

/**
 * @title GoalFactory
 * @dev This is base contract for creating any goal
 */

import "./GoalRegistry.sol";

contract GoalFactory {

    GoalRegistry public goalRegistry;
    address public emergencyMultisig;

    function GoalFactory(address _goalRegistry, address _emergencyMultisig) {
        // constructor
        goalRegistry = GoalRegistry(_goalRegistry);
        emergencyMultisig = _emergencyMultisig;
    }

    function registerGoal(
        address newGoal,
        string tag,
        address founder,
        address founderWallet)
        internal
    {
        require(newGoal != 0x0);

        goalRegistry.registerGoal(
            newGoal,
            tag,
            founder,
            founderWallet);
    }

}
