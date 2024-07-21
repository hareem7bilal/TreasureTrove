var app = angular.module("treasureTrove", []);

app.controller("mainController", function ($scope, $http) {
    $scope.inventory = [];
    $scope.newBids = [];
    $scope.compareChecked = [];

    // GET list of items and latest bids
    $scope.retrieveItemList = () => {

        console.log("$scope.retrieveItemList() called");

        fetch("http://127.0.0.1:3000",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    query: "{ merchandises { id name description lastBid lastBidUser imageUrl }}"
                })
            }
        )
        .then((res) => res.json())
        .then((result) => { 
            console.log(result.data);
            $scope.$apply( () => $scope.inventory = result.data.merchandises );
        })
        .catch((error) => console.log("Server responded with an error: " + error) );
    };

    $scope.updateNow = (id, index) => {

        console.log("$scope.updatNow(" + id + ", " + index +  ") called");

        fetch("http://127.0.0.1:3000",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    query: `
                        query Merchandise($id: ID) {
                            merchandise(id: $id) {
                                lastBid
                                lastBidUser
                            }
                        }             
                    `,
                    variables: {
                        id: id
                    }    
                })
            }
        )
        .then((res) => res.json())
        .then((result) => { 
            console.log(result.data);
            $scope.$apply( () => {
                $scope.inventory[index].lastBid = result.data.merchandise.lastBid ;
                $scope.inventory[index].lastBidUser = result.data.merchandise.lastBidUser;
            });
        })
        .catch((error) => console.log("Server responded with an error: " + error) );        

    }

    $scope.compareItems = () => {
        
        console.log("$scope.compareItems() called");

        // need to have exactly 2 items selected
        var count = 0;
        var id1 = undefined
        var id2 = undefined

        $scope.inventory.forEach(item => {

            const box = document.getElementById(item.id);
            if (box.checked) {
                count ++;
                if (id1 === undefined) {
                    id1 = item.id
                }
                else { id2 = item.id };
            }
        });

        if (count != 2) {
            alert("Error: To compare items, check EXACTLY 2 items");
            return;
        }

        console.log("Comparing: " + id1 + " " + id2);
        
        // now get the two items

        console.log("$scope.retrieveItemList() called");

        fetch("http://127.0.0.1:3000",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    query: `
                        query twoMerchandises($id1: ID, $id2: ID) {
                            m1: merchandise(id: $id1) {
                            ...infoOnly
                            }
                        
                            m2: merchandise(id: $id2) {
                            ...infoOnly
                            }
                        }
                        
                        fragment infoOnly on Merchandise {
                            id
                            name
                            description
                        },                
                    `,
                    variables: {
                        id1: id1,
                        id2: id2
                    }    
                })
            }
        )
        .then((res) => res.json())
        .then((result) => { 
            console.log(result.data);
            // $scope.$apply( () => $scope.inventory = result.data.merchandises );
            var str = result.data.m1.name + " vs. " + result.data.m2.name;
            alert(str);
        })
        .catch((error) => console.log("Server responded with an error: " + error) );

    }

    // POST a new bid

    $scope.sendBid = (itemId, newBid, newBidUser) => {
        console.log("$scope.sendBid(" + itemId + ", " + newBid + ", " + newBidUser + ") called");

        fetch("http://127.0.0.1:3000",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                query: `
                    mutation submitBid($id: ID, $newBid: Float, $newBidUser: String) {

                        submitBid(id: $id, newBid: $newBid, newBidUser: $newBidUser) {
                            accepted
                            reason
                        }
                    
                    }
                `,
                variables: {
                    id: itemId,
                    newBid: newBid,
                    newBidUser: "lindam"
                }
            })
        })
        .then((res) => res.json())
        .then((result) => { 
            console.log(result.data.submitBid);
            if (result.data.submitBid.accepted) {
                $scope.retrieveItemList();
            }
            else {
                alert("Server responsed with an error: " + result.data.submitBid.reason);
            }

        })
        .catch((error) => console.log("Server responded with an error: " + error) );

    };

    $scope.evilQuery = () => {
        console.log("$scope.evilQuery() called");

        fetch("http://127.0.0.1:3000",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    query: `
                    query Merchandise($id: ID) {
                        merchandise(id: $id) {
                            id
                            name
                            relatedMerchandise {
                              id
                              name
                              relatedMerchandise {
                                id
                                name
                                relatedMerchandise {
                                  id
                                  name
                                  relatedMerchandise {
                                    id
                                    name
                                    relatedMerchandise {
                                      id
                                      name                                          
                                      relatedMerchandise {
                                        id
                                        name
                                        relatedMerchandise {
                                          id
                                          name                                          
                                        }
                                      }
                                    }
                                  }
                                }                                    
                              }                            
                            }
                        }
                    }           
                    `,
                    variables: {
                        id: "a0001-11"
                    }    
                })
            }
        )
        .then((res) => res.json())
        .then((result) => { 
            console.log(result);
        })
        .catch((error) => console.log("Server responded with an error: " + error) );           
    }

    $scope.retrieveItemList();
    setInterval($scope.retrieveItemList, 9000);

});
