pragma solidity 0.4.15;

/**
 * @title SubscribeGoal
 * @dev Subscribe Goal provides founder a way to raise fund through
 * multiple rounds. This can be used for monthly fundraise.
 */

import "./Goal.sol";
import "./GoalLibrary.sol";
import "./SubscribeGoalLibrary.sol";

contract SubscribeGoal is Goal {

    using SubscribeGoalLibrary for SubscribeGoalLibrary.Fundraise;

    SubscribeGoalLibrary.Fundraise internal fundraise;

    function SubscribeGoal(
        address _goalRegistry,
        uint    _goType,
        address _founder,
        address _founderWallet,
        address _emergencyMultisig,
        string  _goalTag,
        string  _goalTopic,
        bytes32 _goalContentHash,
        uint    _initialRaiseTarget)
        Goal(_goalRegistry,
             _goType,
             _founder,
             _founderWallet,
             _emergencyMultisig,
             _goalTag,
             _goalTopic,
             _goalContentHash)
     {
         // constructor
         fundraise.setRoundTarget(_initialRaiseTarget);
         goal.active();
     }

     function getRoundRaiseTarget()
        external constant returns (uint)
    {
        return fundraise.getRoundRaiseTarget();
    }

    function getRoundTotalFund()
        external constant returns (uint)
    {
        return fundraise.getRoundTotalFund();
    }

    function getRoundUserFund()
        external constant returns (uint)
    {
        return fundraise.getRoundUserFund();
    }

    function setRoundTarget(uint target)
        onlyFounder
        external
    {
        require(goal.status != GoalLibrary.Status.Cancel &&
                goal.status != GoalLibrary.Status.Finish);

        fundraise.setRoundTarget(target);
    }

    function back()
        onlyStatus(GoalLibrary.Status.Active)
        payable public
    {
        fundraise.back();
    }

    function withdraw()
        external
    {
        require(goal.status == GoalLibrary.Status.Active ||
                goal.status == GoalLibrary.Status.Cancel);

        fundraise.withdraw();
    }

    function finishRound()
        onlyFounder
        onlyStatus(GoalLibrary.Status.Active)
        external
    {
        fundraise.finishRound(goal.founderWallet);
    }

    function ()
        payable
    {
        back();
    }

}
