PLEASE READ THIS TO BE ABLE TO DEPLOY WILDFLY ON YOUR MACHINE OR SERVER

1- Copy one of the standalone files to your $WILDYFLY_HOME\standalone\configuration folder, make sure you change the name
to only standalone.xml. This file will load all necessary configurations to Wildfly

2- Copy mysql-connector-j-8.0.33.jar (This version was tested and works 100%) to $WILDYFLY_HOME\standalone\deployments
this way Wildfly will deploy the connector on its own and no need to configure anything else.

FEEL FREE TO REPORT ANY ISSUSES TO OUR GITHUB https://github.com/yass2406/leave-management-system.git