angular.module("contactsApp", ['ngRoute'])
    .config(function($routeProvider) {
        $routeProvider
            .when("/", {
                templateUrl: "list.html",
                controller: "ListController",
                resolve: {
                    contacts: function(Contacts) {
                        return Contacts.getContacts();
                    },
                    devices: function(Devices) {
                        return Devices.getDevices();
                    }
                }
            })
            .when("/new/contact", {
                controller: "NewContactController",
                templateUrl: "contact-form.html"
            })
            .when("/contact/:contactId", {
                controller: "EditContactController",
                templateUrl: "contact.html"
            })
            .otherwise({
                redirectTo: "/"
            })
    })
    .service("Notifications", function($http){
        this.sendNotification = function(deviceId){
            var url = "/notification/" + deviceId;
            return $http.get(url).
            then(function(response) {
                return response;
            }, function(response) {
                alert("Error sending notification." + response);
            });

        }
    })
    .service("Devices", function($http) {
        this.getDevices = function () {
            return $http.get("/devices").then(function (response) {
                return response;
            }, function (response) {
                alert("Error finding devices.");
            });
        }
        this.createDevice = function (device) {
            return $http.post("/devices", device).then(function (response) {
                return response;
            }, function (response) {
                alert("Error creating device.");
            });
        }
        this.getDevice = function(deviceId) {
            console.log("aca");
            var url = "/devices/" + deviceId;
            console.log(url);
            return $http.get(url).then(function(response) {
                return response;
            }, function(response) {
                alert("Error finding this device.");
            });
        }
    })
    .service("Contacts", function($http) {
        this.getContacts = function() {
            return $http.get("/contacts").
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error finding contacts.");
                });
        }
        this.createContact = function(contact) {
            return $http.post("/contacts", contact).
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error creating contact.");
                });
        }
        this.getContact = function(contactId) {
            var url = "/contacts/" + contactId;
            return $http.get(url).
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error finding this contact.");
                });
        }
        this.editContact = function(contact) {
            var url = "/contacts/" + contact._id;
            console.log(contact._id);
            return $http.put(url, contact).
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error editing this contact.");
                    console.log(response);
                });
        }
        this.deleteContact = function(contactId) {
            var url = "/contacts/" + contactId;
            return $http.delete(url).
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error deleting this contact.");
                    console.log(response);
                });
        }
    })



    .controller("ListController", function(contacts, devices, $scope, Notifications) {
        $scope.contacts = contacts.data;
        $scope.devices = devices.data;

        $scope.sendMsg = function(id) {
            console.log($scope);
            Notifications.sendNotification({id : id, textMessage : $scope.textMessage.value}).then(function(doc) {
                console.log(doc);
            }, function(response) {
                console.log(response);
            });
        }
    })
    .controller("NewContactController", function($scope, $location, Contacts) {
        $scope.back = function() {
            $location.path("#/");
        }

        $scope.saveContact = function(contact) {
            Contacts.createContact(contact).then(function(doc) {
                var contactUrl = "/contact/" + doc.data._id;
                $location.path(contactUrl);
            }, function(response) {
                alert(response);
            });
        }
    })
    .controller("EditContactController", function($scope, $routeParams, Contacts) {
        Contacts.getContact($routeParams.contactId).then(function(doc) {
            $scope.contact = doc.data;
        }, function(response) {
            alert(response);
        });

        $scope.toggleEdit = function() {
            $scope.editMode = true;
            $scope.contactFormUrl = "contact-form.html";
        }

        $scope.back = function() {
            $scope.editMode = false;
            $scope.contactFormUrl = "";
        }

        $scope.saveContact = function(contact) {
            Contacts.editContact(contact);
            $scope.editMode = false;
            $scope.contactFormUrl = "";
        }

        $scope.deleteContact = function(contactId) {
            Contacts.deleteContact(contactId);
        }
    });