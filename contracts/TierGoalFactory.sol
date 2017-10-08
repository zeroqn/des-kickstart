pragma solidity 0.4.15;

/**
 * @title TierGoal Factory
 * @dev This factory contract is used to create and register TierGoal.
 */

import "./GoalFactory.sol";
import "./TierGoal.sol";

contract TierGoalFactory is GoalFactory {

    function TierGoalFactory(
        address _goalRegistry,
        address _emergencyMultisig)
        GoalFactory(_goalRegistry, _emergencyMultisig)
    {
        // constructor
    }

    function kickNewGoal(
        address _founder,
        address _founderWallet,
        string  _goalTag,
        string  _goalTopic,
        bytes32 _goalContentHash)
        external
    {
        address newGoal = new TierGoal(
            goalRegistry,
            _founder,
            _founderWallet,
            emergencyMultisig,
            _goalTag,
            _goalTopic,
            _goalContentHash);

        registerGoal(
            newGoal,
            _goalTag,
            _founder,
            _founderWallet);
    }
}
