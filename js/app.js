'use strict';

/* Controllers */

(function () {

    var battleApp = angular.module('battleApp', []);
    //var primePhones = [];

    //battleApp.controller('FightController', function($scope) {
    //    $scope.liveInfo = liveInfo;
    //    $scope.playGame = goPlay;
    //});

    //ugly hack for initial shuffle
    var liveInfo = {
        shuffles: 1
    };

    var MainController = function ($scope) {
        $scope.username = "Player"
        $scope.playerNum = 2;

        $scope.setup = function (playerNum, username01, username02, username03, username04, username05, username06) {

            $scope.username = [username01, username02, username03, username04, username05, username06];

            console.log("Start game:");

            //cool undefined debug technique
            //    if (liveInfo.livePlayers[liveInfo.winners[0]] == undefined){
            //    console.log("winner butt!");
            //    }

            var playerCount = $scope.playerNum;
            var players = [];

            //function to change 11-13 to face cards
            var convert_value_to_string = function (value) {
                if (value > 10) {
                    switch (value) {
                    case 11:
                        return 'Jack';
                        break;
                    case 12:
                        return 'Queen';
                        break;
                    case 13:
                        return 'King';
                        break;
                    }
                }
                return value.toString();
            }

            //create 52 card "deck", 13 cards, 4 suits
            var deck = [],
                suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'],
                i = 0;
            for (i = 0; i < suits.length; i++) {
                var suit = suits[i],
                    j = 0;
                for (j = 0; j < playerCount / 2; j++) {
                    var k = 0;
                    for (k = 0; k < 13; k++) {
                        deck.push({
                            num: k + 1,
                            suit: suit
                        });
                    }
                }
            }



            //function to shuffle "deck" array, return new shuffled array "copy"
            var shuffle = function (array) {
                var copy = [],
                    n = array.length,
                    i;
                while (n) {
                    i = Math.floor(Math.random() * array.length);
                    if (i in array) {
                        copy.push(array[i]);
                        delete array[i];
                        n--;
                    }
                }

                return copy;
            }

            //call the shuffle function, save the result as "deck"
            var deck = shuffle(deck);

            //function to divide deck into eqaul parts, for all player objects, players also created here
            var deal = function (deck) {
                var handSize = (deck.length - (deck.length % playerCount)) / playerCount;
                for (var i = 0; i < playerCount; i++) {
                    players[i] = {
                        wins: 0,
                        winP: function () {
                            if (this.wins > 0) {
                                return Math.floor(this.wins / liveInfo.rounds * 100);
                            } else {
                                return 0
                            }
                        },
                        battleTime: true,
                        winner: false,
                        liveCard: [],
                        name: $scope.username[i],
                        isAlive: function () {
                            return ((this.hand.length + this.discard.length) > 0);
                        },
                        stringMe: function () {
                            return (convert_value_to_string(this.hand[0].num));
                        },
                        id: Date.now() + i,
                        hand: deck.splice(0, handSize),
                        discard: []
                    };

                }
                return deck;
            };


            var liveInfo = {
                rounds: 0,
                shuffles: 1,
                deaths: 0,
                winners: [],
                winnerId: 0,
                liveCards: [],
                deadCards: [],
                unusedCards: deal(deck),
                livePlayers: players,
                warPlayers: [],
                deadPlayers: [],
                liveCount: function () {
                    return this.livePlayers.length
                },
                deadCount: function () {
                    return this.deadPlayers.length
                },
                unusedCount: function () {
                    return this.unusedCards.length
                },
                usedCount: function () {
                    var totalCards = 0;
                    for (var i = 0; i < this.livePlayers.length; i++) {
                        totalCards += (this.livePlayers[i].hand.length + this.livePlayers[i].discard.length);
                    }
                    return totalCards
                },
                cardCount: function () {
                    return (liveInfo.usedCount() + " used + " + liveInfo.unusedCount() + " unused = " + (liveInfo.usedCount() + liveInfo.unusedCount()) + " Cards Total");
                }
            };


            for (var i = 0; i < liveInfo.livePlayers.length; i++) {
                console.log(liveInfo.livePlayers[i].name + "'s Health: " + (liveInfo.livePlayers[i].hand.length + liveInfo.livePlayers[i].discard.length));
            }

            function findWinners() {

                liveInfo.winners = [];
                var currentHighestCard = -1;
                for (var i = 0; i < liveInfo.livePlayers.length; ++i) {
                    var player = liveInfo.livePlayers[i];
                    if (player.battleTime) {
                        player.liveCard.push(player.hand.shift());

                        var playerCardNumber = player.liveCard[0].num;

                        if (playerCardNumber > currentHighestCard) {
                            liveInfo.winners = [player.id];
                            liveInfo.deadCards.push(player.liveCard.shift());
                            player.battleTime = false;
                            currentHighestCard = playerCardNumber;
                        } else if (playerCardNumber == currentHighestCard) {
                            liveInfo.winners.push(player.id)
                            liveInfo.deadCards.push(player.liveCard.shift());
                            player.battleTime = false;
                        } else {
                            liveInfo.deadCards.push(player.liveCard.shift());
                            player.battleTime = false;
                        }
                    }
                }
                //tag the winners with a TRUE
                for (var i = 0; i < liveInfo.winners.length; ++i) {
                    var winner = liveInfo.winners[i];
                    for (var j = 0; j < liveInfo.livePlayers.length; ++j) {

                        var player = liveInfo.livePlayers[j];

                        if (player.id == winner && !player.battleTime) {
                            player.winner = true;
                            player.battleTime = true;
                        }
                    }
                }
            }

            //create a function called "war" that resolves ties by adding up to 3 cards (per player) to the dead pile and determines 1 true winner
            var war = function (liveInfo) {

                console.log("\nW-A-R!!!");

                //shuffle players discard back into hand if hand is less than 4
                for (var i = 0; i < liveInfo.livePlayers.length; i++) {
                    var player = liveInfo.livePlayers[i];

                    if (player.winner && player.hand.length < 4) {
                        console.log(player.name + " IS SHUFFLING!!!");
                        liveInfo.shuffles++;
                        //liveInfo.shuffles ++;
                        player.discard = (shuffle(player.discard))
                        for (var j = 0; j < player.discard.length; j++) {
                            //console.log(player.name + "'s Handsize: " + player.hand.length); 
                            player.hand.push(player.discard.shift());
                        }
                    }

                    //if player is involved with this war, move as many cards (up to 3) into the prize
                    if (player.winner) {
                        switch (player.hand.length) {
                        case 0:
                            player.battleTime = false;
                            break;
                        case 1:
                            break;
                        case 2:
                            liveInfo.deadCards.push(player.hand.shift());
                            break;
                        case 3:
                            liveInfo.deadCards.push(player.hand.shift());
                            liveInfo.deadCards.push(player.hand.shift());
                            break;
                        default:
                            liveInfo.deadCards.push(player.hand.shift());
                            liveInfo.deadCards.push(player.hand.shift());
                            liveInfo.deadCards.push(player.hand.shift());
                            break;
                        }
                    }

                }

                for (var i = 0; i < liveInfo.livePlayers.length; i++) {
                    liveInfo.livePlayers[i].winner = false;
                }

                findWinners();

                return liveInfo;
            }

            //tag the winners with a TRUE
            var winnerTag = function () {
                for (var i = 0; i < liveInfo.winners.length; ++i) {
                    var winner = liveInfo.winners[i];
                    for (var j = 0; j < liveInfo.livePlayers.length; ++j) {

                        var player = liveInfo.livePlayers[j];

                        if (player.id == winner && !player.battleTime) {
                            player.winner = true;
                            player.battleTime = true;
                        }
                    }
                }
            }

            //sort dead players (players with no cards) from the living
            var deathCheck = function () {
                for (var i = 0; i < liveInfo.livePlayers.length; i++) {

                    if (!liveInfo.livePlayers[i].isAlive()) {
                        console.log(liveInfo.livePlayers[i].name + " IS DEAD!!!");
                        liveInfo.deaths++;
                        liveInfo.deadPlayers.push(liveInfo.livePlayers.splice(i, 1));
                        --i;
                    }
                }
            }

            //refil players hand if possible
            var handCheck = function () {
                for (var i = 0; i < liveInfo.livePlayers.length; i++) {
                    if (liveInfo.livePlayers[i].hand.length == 0) {
                        console.log(liveInfo.livePlayers[i].name + " IS SHUFFLING!!!");
                        liveInfo.shuffles++;
                        liveInfo.livePlayers[i].hand = shuffle(liveInfo.livePlayers[i].discard);
                        liveInfo.livePlayers[i].discard = [];

                    }
                }
            }

            //create a function (algorithm) called "battle" that takes live players top cards as parameters, compares them and returns a winner. A tie should do awesome things.
            var battle = function (liveInfo) {
                var cardValueOnly = [];




                findWinners();

                //while more than 2 winners, execute war function
                while (liveInfo.winners.length > 1) {
                    //var liveInfo = war(liveInfo);
                    liveInfo = war(liveInfo);
                }

                //give the winner all the dead cards
                console.log("\nThe Prize: " + liveInfo.deadCards.length + " Cards");
                for (var i = 0; i < liveInfo.livePlayers.length; i++) {
                    liveInfo.livePlayers[i].battleTime = true;
                    if (liveInfo.livePlayers[i].winner) {
                        console.log("The Winner: " + liveInfo.livePlayers[i].name);
                        liveInfo.livePlayers[i].wins++;
                        liveInfo.livePlayers[i].winner = false;
                        while (liveInfo.deadCards.length) {
                            liveInfo.livePlayers[i].discard.push(liveInfo.deadCards.shift());
                        }
                    }
                }



                return liveInfo;
            }



            //create a play function
            var play = function () {
                liveInfo = battle(liveInfo);


                //display total card count and player health
                //console.log("End of round:");
                liveInfo.rounds++;


                for (var i = 0; i < liveInfo.livePlayers.length; i++) {
                    console.log(liveInfo.livePlayers[i].name + "'s Health: " + (liveInfo.livePlayers[i].hand.length + liveInfo.livePlayers[i].discard.length) + "\n");
                }

                console.log(liveInfo.cardCount());
                console.log(liveInfo);
                console.log(liveInfo.livePlayers[0].wins / liveInfo.rounds);

            }

            function progressBar(percent, $element) {
                var progressBarWidth = percent * $element.width() / 100;
                $element.find('div').animate({
                    width: progressBarWidth
                }, 125).html(percent + "%&nbsp;");
            }



            //put "play" function on "battle" button
            //$(".btn").click(function() {
            var goPlay = function () {
                if (liveInfo.livePlayers.length > 1) {
                    play();
                    deathCheck();
                    if (liveInfo.livePlayers.length > 1) {
                        handCheck();
                    }
                }
            }

            $scope.liveInfo = liveInfo;
            $scope.playGame = goPlay;
            $scope.playerSortOrder = "+name";

        }

    };

    //create liveInfo object filled with game info
    //notice "deal" function on "unusedCards" returns the cards that are not being used this game



    //            return liveInfo;
    //});
    battleApp.controller("MainController", MainController);

    //var primePhones = [{name: 1, snippet: "woo"},{name: 2, snippet: "boo"},{name: 3, snippet: "woot"},{name: 4, snippet: "boot"}];

}());