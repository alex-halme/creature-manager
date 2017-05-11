'use strict';

var app = angular.module('myApp.view1', ['ngRoute', 'ui.sortable', 'angucomplete-alt'])

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

    $scope.gameCreatures = [
      // { name: 'Orc', health: '12', healthDice: '2d6', damage: '1d8', initative: '', AC: 13, challenge: '1/2' },

      { name: 'Goblin', description: 'Small humanoid (goblinoid)', 
        alignment: 'neutral evil', ACEquipment: 'leather armor, shield', AC: 15, health: '7', healthDice: '2d6', 
        speed: '30 ft.', stats: [ '8 (-1)', '14 (+2)', '10 (+0)', '10 (+0)', '8 (-1)', '8 (-1)' ],
        skills: 'Stealth +6', senses: 'darkvision 60ft., passive Perception 9', languages: 'Common, Goblin', challenge: '1/4', xp: '50',
        abilities: [{ title: 'Nimble Escape.', content: 'The Goblin can take the Disengage or Hide action as a bonus action on each of its turns.'}],
        actions: [{ title: 'Scimitar.', type: 'Melee Weapon Attack', descr: '+4 to hit, reach 5 ft., one target.', damage: 'Hit: 5 (1d6 + 2) slashing damage.'}, 
        {title: 'Shortbow.', type: 'Ranged Weapon Attack', descr: '+4 to hit, range 80/320 ft., one target.', damage: 'Hit: 5 (1d6 + 2) piercing damage.'}]
      }
      //  damage: '1d6', initative: '', challenge: '1/2' }
    ];

    $scope.sortableOptions = {
      'ui-floating': true
    };

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

    $scope.addCreature = function () {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'creature-creation-modal.html',
        controller: 'NewCreatureDialogController',
        controllerAs: '$ctrl',
        resolve: {
          gameCreatures: function () {
            return $scope.gameCreatures;
          },
          $uibModal: function () {
            return $uibModal;
          }
        }
      });

      modalInstance.result.then(function (creatures) {
        for (var i = 0; i < creatures.length; i++) {
          $scope.creatures.push(creatures[i]);
        }
        console.log('Creature(s) added');
      }, function () {
        console.log('Creation cancelled');
      });
    }

    $scope.info = function (creature) {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'info-modal.html',
        controller: 'InfoDialogController',
        controllerAs: '$ctrl',
        resolve: {
          creature: function () {
            return creature;
          }
        }
      });

      modalInstance.result.then(function (creature) {
        console.log("Exited info modal");
      });
    }

    $scope.addSeparator = function () {
      var separator = { name: "", health: "", damage: "", initiative: "", AC: "", tag: "hide" };
      $scope.creatures.push(separator);
    }

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

    $scope.attack = function (index, creature) {
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

      modalInstance.result.then(function (updatedCreature) {
        $scope.creatures[index] = updatedCreature;
        console.log('Attack completed');
      }, function () {
        console.log('Attack cancelled');
      });

    };
  }]);


angular.module('myApp.view1').controller('AttackDialogController', function ($uibModalInstance, creat) {
  var $ctrl = this;

  $ctrl.creature = angular.copy(creat);
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
    $uibModalInstance.close($ctrl.creature);
  };

  $ctrl.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});

angular.module('myApp.view1').controller('CustomCreatureDialogController', function ($uibModalInstance) {
  var $ctrl = this;

  $ctrl.create = function () {
    var newCreature = { name: $ctrl.creatureName, health: $ctrl.creatureHealth, damage: $ctrl.creatureDamage, initiative: $ctrl.creatureInitiative, AC: $ctrl.creatureAC };
    $uibModalInstance.close(newCreature);
  }

  $ctrl.isCreatureValid = function () {
    if (!$ctrl.creatureName) {
      return false;
    }

    if ($ctrl.creatureInitiative && ($ctrl.creatureInitiative <= 0 || $ctrl.creatureInitiative > 20)) {
      return false;
    } else if ($ctrl.creatureAC && ($ctrl.creatureAC <= 0 || $ctrl.creatureAC > 20)) {
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
  }

  $ctrl.isEditValid = function () {

    if (!$ctrl.creature.name) {
      return false;
    }

    if ($ctrl.creature.initiative && ($ctrl.creature.initiative <= 0 || $ctrl.creature.initiative > 20)) {
      return false;
    } else if ($ctrl.creature.AC && ($ctrl.creature.AC <= 0 || $ctrl.creature.AC > 20)) {
      return false;
    }

    return true;
  }
});

angular.module('myApp.view1').controller('InfoDialogController', function ($uibModalInstance, creature) {
  var $ctrl = this;
  $ctrl.creature = creature;

  $ctrl.cancel = function () {
    $uibModalInstance.close();
  };

  $ctrl.hasHealthDice = function () {
    if ($ctrl.creature.healthDice === undefined) {
      return false;
    }
    return true;
  }

});

angular.module('myApp.view1').controller('NewCreatureDialogController', function ($uibModalInstance, gameCreatures, $uibModal) {
  var $ctrl = this;
  $ctrl.creatures = [];
  $ctrl.gameCreatures = gameCreatures;

  console.log(gameCreatures[1].stats);

  $ctrl.duplicate = function (index, creature) {
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'duplicate-create-modal.html',
      controller: 'DuplicateDialogController',
      controllerAs: '$ctrl',
      resolve: {
        index: function () {
          return index;
        },
        creature: function () {
          return creature;
        }
      }
    });

    modalInstance.result.then(function (howMany) {
      creature.amount += howMany;
      console.log('Duplication succeeded');
    }, function () {
      console.log('Duplication cancelled');
    });
  }

  $ctrl.canCreatureBeAdded = function () {
    var name = $ctrl.creatureName;
    for (var i = 0; i < gameCreatures.length; i++) {
      if (gameCreatures[i].name === name) {
        return true;
      }
    }
    return false;
  }

  $ctrl.selectedCreature = function (selected) {
    var name = selected.title;
    for (var i = 0; i < gameCreatures.length; i++) {

      if (gameCreatures[i].name === name) {
        console.log(gameCreatures[i].name + " - " + name);
        var creature = angular.copy(gameCreatures[i]);
        var realCreature;

        for (var i = 0; i < $ctrl.creatures.length; i++) {
          if ($ctrl.creatures[i].name === name) {
            realCreature = $ctrl.creatures[i];
          }
        }

        if (realCreature === undefined) {
          creature.amount = 1;
          $ctrl.creatures.push(creature);
        } else {
          realCreature.amount += 1;
        }

        return;
      }
    }
  }

  $ctrl.duplicateOnce = function (index) {
    $ctrl.creatures[index].amount += 1;
  }

  $ctrl.amountOf = function (creature) {
    for (var i = 0; i < $ctrl.creatures.length; i++) {
      if ($ctrl.creatures[i].name === creature.name) {
        return $ctrl.creatures[i].amount;
      }
    }
    return -1;
  }

  $ctrl.canConfirm = function () {
    if ($ctrl.creatures.length > 0) {
      return true;
    }
    return false;
  }

  $ctrl.confirm = function () {
    var finalCreatures = angular.copy($ctrl.creatures);
    for (var i = 0; i < $ctrl.creatures.length; i++) {
      for (var x = 0; x < $ctrl.creatures[i].amount - 1; x++) {
        finalCreatures.push($ctrl.creatures[i]);
      }
      delete finalCreatures[i].amount;
    }

    finalCreatures.sort(function (a, b) { // alphabetical sort
      var textA = a.name.toUpperCase();
      var textB = b.name.toUpperCase();
      return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
    });

    $uibModalInstance.close(finalCreatures);
  }

  $ctrl.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});

angular.module('myApp.view1').controller('DuplicateDialogController', function ($uibModalInstance, index, creature) {
  var $ctrl = this;
  $ctrl.index = index;
  $ctrl.creature = creature;

  $ctrl.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };

  $ctrl.canDuplicate = function () {
    if ($ctrl.numberToAdd > 0 && (creature.amount + Number($ctrl.numberToAdd)) < 101) {
      return true;
    } 
    return false;
  }

  $ctrl.duplicate = function () {
    $uibModalInstance.close(Number($ctrl.numberToAdd));
  }

  $ctrl.amountAfterDuplication = function () {
    if (isNaN($ctrl.numberToAdd)) {
      return creature.amount - 1;
    }
    return Number($ctrl.numberToAdd) + creature.amount - 1;
  }
});