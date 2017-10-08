pragma solidity 0.4.15;

/**
 * @title TierGoalLibray
 * @dev This library implements most of logic for handling TierGoal.
 */

import "./FundLibrary.sol";
import "./BasicMathLib.sol";

library TierGoalLibrary {

    using FundLibrary for FundLibrary.Fund;
    using BasicMathLib for uint;

    struct Tier {
        bytes32 name;
        bytes32 description;
        uint    supply;
        uint    price;
    }

    struct Fundraise {
        uint                               totalFund;
        mapping (uint => FundLibrary.Fund) tierFunds;
        mapping (uint => Tier)             tiers;
    }

    function getTotalFund(Fundraise storage fundraise)
        internal constant returns (uint)
    {
        return fundraise.totalFund;
    }

    function getTierTotalFund(Fundraise storage fundraise, uint tierNumber)
        internal constant returns (uint)
    {
        return fundraise.tierFunds[tierNumber].getTotalFund();
    }

    function getUserFund(Fundraise storage fundraise, uint tierNumber)
        internal constant returns (uint)
    {
        return fundraise.tierFunds[tierNumber].getUserFund();
    }

    function addTiers(
        Fundraise storage fundraise,
        bytes32[] names,
        bytes32[] descriptions,
        uint[] supplys,
        uint[] prices)
        internal
    {
        require(names.length == descriptions.length);
        require(names.length == supplys.length);
        require(names.length == prices.length);

        for (uint i = 0; i < names.length; i++) {
            validTier(names[i], descriptions[i], supplys[i], prices[i]);

            var tier = Tier(names[i],
                            descriptions[i],
                            supplys[i],
                            prices[i]);

            fundraise.tiers[i] = tier;
        }
    }

    function updateTier(
        Fundraise storage fundraise,
        uint tierNumber,
        bytes32 name,
        bytes32 description,
        uint supply,
        uint price)
        internal
    {
        validTier(name, description, supply, price);

        fundraise.tiers[tierNumber] = Tier(name, description, supply, price);
    }

    function getTier(
        Fundraise storage fundraise,
        uint tierNumber)
        internal constant returns (bytes32, bytes32, uint, uint)
    {
        var tier = fundraise.tiers[tierNumber];
        return (tier.name, tier.description, tier.supply, tier.price);
    }

    function back(Fundraise storage fundraise, uint tierNumber)
        internal
    {
        require(fundraise.tiers[tierNumber].price == msg.value);

        bool overflow;
        uint totalFund = fundraise.totalFund;
        (overflow, totalFund) = totalFund.plus(msg.value);
        assert(!overflow);

        fundraise.totalFund = totalFund;
        fundraise.tierFunds[tierNumber].back();
    }

    function withdraw(Fundraise storage fundraise, uint tierNumber)
        internal
    {
        bool underflow;
        uint amount = getUserFund(fundraise, tierNumber);
        require(amount > 0);

        (underflow, fundraise.totalFund) = fundraise.totalFund.minus(amount);
        assert(!underflow);

        fundraise.tierFunds[tierNumber].withdraw();
    }

    function finish(
        Fundraise storage fundraise,
        address wallet)
        internal
    {
        wallet.transfer(fundraise.totalFund);
    }

    function validTier(
        bytes32 name,
        bytes32 description,
        uint supply,
        uint price)
        private
    {
        require(name != "");
        require(description != "");
        require(supply > 0);
        require(price > 0);
    }

}
