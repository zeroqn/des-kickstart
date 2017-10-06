pragma solidity 0.4.15;

/**
 * @title Goal Registry
 * @dev A registry can be used to check whether a address is a goal.
 */

import "./FactoryUtils.sol";

contract GoalRegistry is FactoryUtils {

    mapping (address => bool) public isGoal;

    event OnNewGoalKicked(
        address indexed goal,
        string tag,
        address founder,
        address founderWallet,
        uint indexed minFundraiseTarget);

    function registerGoal(
        address newGoal,
        string  tag,
        address founder,
        address founderWallet,
        uint    minFundraiseTarget)
        onlyFactory
        external
    {
        isGoal[newGoal] = true;
        OnNewGoalKicked(
            newGoal,
            tag,
            founder,
            founderWallet,
            minFundraiseTarget
        );
    }

}
