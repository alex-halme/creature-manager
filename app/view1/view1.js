'use strict';

var app = angular.module('myApp.view1', ['ngRoute'])

  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/view1', {
      templateUrl: 'view1/view1.html',
      controller: 'View1Ctrl'
    });
  }])

  .controller('View1Ctrl', ['$scope', '$uibModal', function ($scope, $uibModal) {

    $scope.creatures = [
      // { name: 'Dummy Demon', health: 123, damage: 234, initiative: 15, AC: 15 },
      // { name: 'Another One', health: 345, damage: 456, initiative: 7, AC: 12 }
    ];

    $scope.createCustom = function () {
      // open dialog
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'custom-creation-modal.html',
        controller: 'CustomCreatureDialogController',
        controllerAs: '$ctrl'
      });

      modalInstance.result.then(function (creature) {
        $scope.creatures.push(creature);
        console.log('Creature added');
      }, function () {
        console.log('Creation cancelled');
      });
    };

    $scope.remove = function (index) {
      $scope.creatures.splice(index, 1);
    }

    $scope.duplicate = function (index) {
      var duplicateCreature = angular.copy($scope.creatures[index]);
      $scope.creatures.push(duplicateCreature);
    }

    $scope.edit = function (index, creature) {
      // open dialog

      var copy = angular.copy(creature);

      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'edit-modal.html',
        controller: 'EditDialogController',
        controllerAs: '$ctrl',
        resolve: {
          creature: function () {
            return copy;
          }
        }
      });

      modalInstance.result.then(function (updatedCreature) {
        // dialog was closed
        console.log(index);
        $scope.creatures[index] = updatedCreature;
        console.log('Edit completed');
      }, function () {
        // dialog was dismissed
        console.log('Edit cancelled');
      });
    };

    $scope.attack = function (creature) {
      // open dialog
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'attack-modal.html',
        controller: 'AttackDialogController',
        controllerAs: '$ctrl',
        resolve: {
          creat: function () {
            return creature;
          }
        }
      });

      modalInstance.result.then(function () {
        console.log('Attack completed');
      }, function () {
        console.log('Attack cancelled');
      });

    };
  }]);


angular.module('myApp.view1').controller('AttackDialogController', function ($uibModalInstance, creat) {
  var $ctrl = this;

  $ctrl.creature = creat;
  $ctrl.attackDamage = null;

  $ctrl.attackEnabled = function () {
    if (isNaN($ctrl.attackDamage)) {
      return false;
    }
    return $ctrl.attackDamage > 0;
  };

  $ctrl.healthAfterAttack = function () {
    var h = $ctrl.creature.health - $ctrl.attackDamage;
    if (isNaN(h)) {
      return NaN;
    }
    if (h < 0) {
      h = 0;
    }
    return h;
  }

  $ctrl.attack = function () {
    $ctrl.creature.health = $ctrl.healthAfterAttack();
    $uibModalInstance.close();
  };

  $ctrl.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});

angular.module('myApp.view1').controller('CustomCreatureDialogController', function ($uibModalInstance) {
  var $ctrl = this;

  $ctrl.create = function () {
    var newCreature = { name: $ctrl.creatureName, health: $ctrl.creatureHealth, damage: $ctrl.creatureDamage, initiative: $ctrl.creatureInitiative, AC: $ctrl.creatureAC};
    $uibModalInstance.close(newCreature);
  }

  $ctrl.isCreatureValid = function () {
    if (!$ctrl.creatureName || !$ctrl.creatureHealth || !$ctrl.creatureDamage || !$ctrl.creatureInitiative || !$ctrl.creatureAC) {
      return false;
    } else if (isNaN($ctrl.creatureHealth) || ($ctrl.creatureInitiative <= 0 || $ctrl.creatureInitiative > 20)) {
      return false;
    } else if ($ctrl.creatureAC <= 0 || $ctrl.creatureAC > 20) {
      return false;
    }
    return true;
  }

  $ctrl.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});

angular.module('myApp.view1').controller('EditDialogController', function ($uibModalInstance, creature) {
  var $ctrl = this;
  $ctrl.creature = creature;

  $ctrl.cancel = function () {
    $uibModalInstance.dismiss();
  };

  $ctrl.save = function () {
    $uibModalInstance.close(creature);
    // $uibModalInstance.close(name, health, damage, initiative);
  }

  $ctrl.isEditValid = function () {
    if (!$ctrl.creature.name && !$ctrl.creature.health && !$ctrl.creature.damage && !$ctrl.creature.initiative) {
      return false;
    } else if (isNaN($ctrl.creature.health) || isNaN($ctrl.creature.initiative)) {
      return false;
    } else if ($ctrl.creature.initiative <= 0 || $ctrl.creature.initiative > 20) {
      return false;
    } else if ($ctrl.creature.AC <= 0 || $ctrl.creature.AC > 20) {
      return false;
    }
    return true;
  }
});

