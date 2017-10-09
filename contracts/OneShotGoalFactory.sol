pragma solidity 0.4.15;

/**
 * @title OneShotGoalFactory
 * @dev This is factory contract which is used to create OneShotGoal. It also
 * register newly created goal through GoalRegistry.
 */

import "./GoalFactory.sol";
import "./OneShotGoal.sol";

contract OneShotGoalFactory is GoalFactory {

  uint public goType = 1;

  function OneShotGoalFactory(
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
      bytes32 _goalContentHash,
      uint    _minFundraiseTarget)
      external
  {
      address newGoal = new OneShotGoal(
          goalRegistry,
          goType,
          _founder,
          _founderWallet,
          emergencyMultisig,
          _goalTag,
          _goalTopic,
          _goalContentHash,
          _minFundraiseTarget);

      registerGoal(
          newGoal,
          goType,
          _goalTag,
          _founder,
          _founderWallet);
  }

}
