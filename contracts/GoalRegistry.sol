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
        uint indexed goType,
        string tag,
        address founder,
        address founderWallet);

    function registerGoal(
        address newGoal,
        uint    goType,
        string  tag,
        address founder,
        address founderWallet)
        onlyFactory
        external
    {
        isGoal[newGoal] = true;
        OnNewGoalKicked(
            newGoal,
            goType,
            tag,
            founder,
            founderWallet
        );
    }

}
