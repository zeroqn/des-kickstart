pragma solidity 0.4.15;

/**
 * @title OneShotGoalLibrary
 * @dev Implement most of logic functions for OneShotGoal. Primary focus on
 * handling fund.
 */

import "./FundLibrary.sol";

library OneShotGoalLibrary {

    using FundLibrary for FundLibrary.Fund;

    struct Fundraise {
        FundLibrary.Fund fund;
    }

    function getTotalFund(Fundraise storage fundraise)
        internal constant returns (uint)
    {
        return fundraise.fund.getTotalFund();
    }

    function getUserFund(Fundraise storage fundraise)
        internal constant returns (uint)
    {
        return fundraise.fund.getUserFund();
    }

    function back(Fundraise storage fundraise)
        internal
    {
        fundraise.fund.back();
    }

    function withdraw(Fundraise storage fundraise)
        internal
    {
        fundraise.fund.withdraw();
    }

    function finish(
        Fundraise storage fundraise,
        address wallet)
        internal
    {
        fundraise.fund.finish(wallet);
    }

}
