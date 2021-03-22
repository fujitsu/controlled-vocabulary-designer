"""
test_example_controller.py COPYRIGHT FUJITSU LIMITED 2021
"""
# coding: utf-8

from __future__ import absolute_import

from flask import json
from six import BytesIO

from swagger_server.models.error_response import ErrorResponse  # noqa: E501
from swagger_server.models.search_success_response import SearchSuccessResponse  # noqa: E501
from swagger_server.test import BaseTestCase


class TestExampleController(BaseTestCase):
    """ExampleController integration test stubs"""

    def test_get_example_phrases(self):
        """Test case for get_example_phrases

        Get example phrases
        """
        query_string = [('index', 789)]
        response = self.client.open(
            '/example/{term}'.format(term='term_example'),
            method='GET',
            query_string=query_string)
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))


if __name__ == '__main__':
    import unittest
    unittest.main()
