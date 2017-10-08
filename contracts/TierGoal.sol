pragma solidity 0.4.15;

/**
 * @title TierGoal
 * @dev TierGoal provides founders a way to set multiple tier rewards to do
 * fundraise.
 */

import "./Goal.sol";
import "./GoalLibrary.sol";
import "./TierGoalLibrary.sol";

contract TierGoal is Goal {

    using TierGoalLibrary for TierGoalLibrary.Fundraise;

    TierGoalLibrary.Fundraise internal fundraise;

    function TierGoal(
        address _goalRegistry,
        address _founder,
        address _founderWallet,
        address _emergencyMultisig,
        string  _goalTag,
        string  _goalTopic,
        bytes32 _goalContentHash)
        Goal(_goalRegistry,
             _founder,
             _founderWallet,
             _emergencyMultisig,
             _goalTag,
             _goalTopic,
             _goalContentHash)
    {
        // constructor
        // pause goal, so founder can add tiers
        goal.pause();
    }

    function getTotalFund()
        external constant returns (uint)
    {
        return fundraise.getTotalFund();
    }

    function getTierTotalFund(uint tierNumber)
        external constant returns (uint)
    {
        return fundraise.getTierTotalFund(tierNumber);
    }

    function getUserFund(uint tierNumber)
        external constant returns (uint)
    {
        return fundraise.getUserFund(tierNumber);
    }

    function addTiers(
        bytes32[] names,
        bytes32[] descriptions,
        uint[] supplys,
        uint[] prices)
        onlyFounder
        onlyStatus(GoalLibrary.Status.Pause)
        external
    {
        fundraise.addTiers(names, descriptions, supplys, prices);
    }

    function updateTier(
        uint tierNumber,
        bytes32 name,
        bytes32 description,
        uint supply,
        uint price)
        onlyFounder
        onlyStatus(GoalLibrary.Status.Pause)
        external
    {
        fundraise.updateTier(tierNumber, name, description, supply, price);
    }

    function getTier(uint tierNumber)
        external constant
        returns (
            bytes32 name,
            bytes32 description,
            uint supply,
            uint price)
    {
        return fundraise.getTier(tierNumber);
    }

    function back(uint tierNumber)
        onlyStatus(GoalLibrary.Status.Active)
        payable external
    {
        require(msg.value > 0);

        fundraise.back(tierNumber);
    }

    function withdraw(uint tierNumber)
        external
    {
        require(goal.status == GoalLibrary.Status.Active ||
                goal.status == GoalLibrary.Status.Cancel);

        fundraise.withdraw(tierNumber);
    }

    function finish()
        onlyFounder
        onlyStatus(GoalLibrary.Status.Active)
        public
    {
        super.finish();

        fundraise.finish(goal.founderWallet);
    }

    function ()
        payable
    {
        revert();
    }

}
