pragma solidity 0.4.15;

/**
 * @title OneShotGoal
 * @dev OneShotGoal is the simplest goal. Founder specify the project's
 * fundraise target, then other users fund the project. When the target is
 * reached, then founder just mark this project then receive the fund.
 */

import "./Goal.sol";
import "./GoalLibrary.sol";
import "./FundraiseLibrary.sol";
import "./OneShotGoalLibrary.sol";

contract OneShotGoal is Goal {

    FundraiseLibrary.Fundraise public fundraise;

    function OneShotGoal(
        address _goalRegistry,
        address _founder,
        address _founderWallet,
        address _emergencyMultisig,
        string  _goalTag,
        string  _goalTopic,
        bytes32 _goalContentHash,
        uint    _minFundraseTarget)
        Goal(_goalRegistry,
             _founder,
             _founderWallet,
             _emergencyMultisig,
             _goalTag,
             _goalTopic,
             _goalContentHash,
             _minFundraseTarget)
    {
        // constructor
    }

    function getTotalFund()
        external constant returns (uint)
    {
        return OneShotGoalLibrary.getTotalFund(fundraise);
    }

    function getUserFund()
        external constant returns (uint)
    {
        return OneShotGoalLibrary.getUserFund(fundraise);
    }

    function fund()
        onlyStatus(GoalLibrary.Status.Active)
        payable public
    {
        require(msg.value > 0);

        OneShotGoalLibrary.fund(fundraise);
    }

    function withdraw()
        external
    {
        require(goal.status == GoalLibrary.Status.Active ||
                goal.status == GoalLibrary.Status.Cancel);

        OneShotGoalLibrary.withdraw(fundraise);
    }

    function finish()
        onlyFounderOrEmergencyMultiSig
        onlyStatus(GoalLibrary.Status.Active)
        public
    {
        super.finish();

        OneShotGoalLibrary.finish(fundraise, goal.founderWallet);
    }

    function ()
        payable
    {
        fund();
    }

}
