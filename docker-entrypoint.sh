#!/bin/sh
set -e

if [ "$ENV" = "DEV" ]; then
	echo "Running Development Application"
	exec npm start

elif [ "$ENV" = "UNIT_TEST" ]; then
	echo "Running Unit Tests"
	exec npm test:unit
	# exec tox -e unit

elif [ "$ENV" = "CONTRACT_TEST" ]; then
	echo "Running Contract Tests"
	exec npm test:contract
	# exec tox -e contract

elif [ "$ENV" = "INTEGRATION_TEST" ]; then
	echo "Running Integration Tests"
	exec npm test:integration
	# exec tox -e integration

elif [ "$ENV" = "COMPONENT_TEST" ]; then
	echo "Running Component Tests"
	exec npm start

elif [ "$ENV" = "END_TO_END_TEST" ]; then
	echo "Running End_To_End Tests"
	exec npm start:prod

elif [ "$ENV" = "LOAD_TEST" ]; then
	echo "Running Load Tests"
	exec npm start:load

elif [ "$ENV" = "PROD" ]; then 
	echo "Running Production Application"
	exec npm start:prod

else
	echo "Please provide an environment"
	echo "Stopping"
fi
