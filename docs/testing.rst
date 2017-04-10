Testing
========

Now, testing is the main deal of the project. You can test in many ways, namely, using ``make`` commands as mentioned in the below commands, which automates everything and you don't have to know anything else, like what test library or framework is being used, how the tests are happening, either directly or via ``docker`` containers. Nothing is required to be known.

But running the make commands is always the go to strategy and reccomended approach for this project.


* To Test everything
  ::

  		$ make test


  Any Other method without using make will involve writing a lot of commands. So use the make command preferrably


* To perform Unit Tests
  ::

  		$ make test-unit


* To perform Component Tests
  ::

  		$ make test-component


* To perform Contract Tests
  ::

  		$ make test-contract


* To perform Integration Tests
  ::

  		$ make test-integration


* To perform End To End (e2e) or System or UI Acceptance or Functional Tests
  ::

  		$ make test-e2e

  		# OR

  		$ make test-system

  		# OR	

  		$ make test-ui-acceptance

  		# OR

  		$ make test-functional


