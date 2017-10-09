pragma solidity 0.4.15;

/**
 * @title OneShotGoal
 * @dev OneShotGoal is the simplest goal. Founder specify the project's
 * fundraise target, then other users fund the project. When the target is
 * reached, then founder just mark this project then receive the fund.
 */

import "./Goal.sol";
import "./GoalLibrary.sol";
import "./OneShotGoalLibrary.sol";

contract OneShotGoal is Goal {

    using OneShotGoalLibrary for OneShotGoalLibrary.Fundraise;

    OneShotGoalLibrary.Fundraise internal fundraise;

    function OneShotGoal(
        address _goalRegistry,
        uint    _goType,
        address _founder,
        address _founderWallet,
        address _emergencyMultisig,
        string  _goalTag,
        string  _goalTopic,
        bytes32 _goalContentHash,
        uint    _fundraiseTarget)
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
        fundraise.setFundTarget(_fundraiseTarget);
    }

    function getTotalFund()
        external constant returns (uint)
    {
        return fundraise.getTotalFund();
    }

    function getUserFund()
        external constant returns (uint)
    {
        return fundraise.getUserFund();
    }

    function back()
        onlyStatus(GoalLibrary.Status.Active)
        payable public
    {
        require(msg.value > 0);

        fundraise.back();
    }

    function withdraw()
        external
    {
        require(goal.status == GoalLibrary.Status.Active ||
                goal.status == GoalLibrary.Status.Cancel);

        fundraise.withdraw();
    }

    function finish()
        onlyFounderOrEmergencyMultiSig
        onlyStatus(GoalLibrary.Status.Active)
        public
    {
        super.finish();

        fundraise.finish(goal.founderWallet);
    }

    function ()
        payable
    {
        back();
    }

}
