pragma solidity 0.4.15;

/**
 * @title SubscribeGoalLibrary
 * @dev This library implement most of logic for handling SubscribeGoal.
 */

import "./FundLibrary.sol";

library SubscribeGoalLibrary {

    using FundLibrary for FundLibrary.Fund;

    struct Fundraise {
        uint                                lastRound;
        mapping (uint => uint)              raiseTargets;
        mapping (uint => FundLibrary.Fund)  funds;
    }

    function getRoundRaiseTarget(Fundraise storage fundraise)
        internal constant returns (uint)
    {
        return fundraise.raiseTargets[fundraise.lastRound];
    }

    function getRoundTotalFund(Fundraise storage fundraise)
        internal constant returns (uint)
    {
        return fundraise.funds[fundraise.lastRound].getTotalFund();
    }

    function getRoundUserFund(Fundraise storage fundraise)
        internal constant returns (uint)
    {
        return fundraise.funds[fundraise.lastRound].getUserFund();
    }

    function setRoundTarget(
        Fundraise storage fundraise,
        uint target)
        internal
    {
        fundraise.raiseTargets[fundraise.lastRound] = target;
    }

    function back(Fundraise storage fundraise)
        internal
    {
        fundraise.funds[fundraise.lastRound].back();
    }

    function withdraw(Fundraise storage fundraise)
        internal
    {
        fundraise.funds[fundraise.lastRound].withdraw();
    }

    /**
     * @dev when the last round is finished, new round will
     * be started with previous round's target. founder can
     * use setRoundTarget() to update the target.
     */
    function finishRound(
        Fundraise storage fundraise,
        address wallet)
        internal
    {
        uint lastRound = fundraise.lastRound;
        uint amount = fundraise.funds[lastRound].getTotalFund();
        wallet.transfer(amount);

        uint prevTarget = fundraise.raiseTargets[lastRound];
        fundraise.lastRound += 1;
        fundraise.raiseTargets[fundraise.lastRound] = prevTarget;
    }

}
