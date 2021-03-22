"""
test_filter_controller.py COPYRIGHT FUJITSU LIMITED 2021
"""
# coding: utf-8

from __future__ import absolute_import

from flask import json
from six import BytesIO

from swagger_server.models.error_response import ErrorResponse  # noqa: E501
from swagger_server.models.pos_filter import PosFilter  # noqa: E501
from swagger_server.models.success_response import SuccessResponse  # noqa: E501
from swagger_server.test import BaseTestCase


class TestFilterController(BaseTestCase):
    """FilterController integration test stubs"""

    def test_get_filter_data(self):
        """Test case for get_filter_data

        Get part of speech filter data.
        """
        response = self.client.open(
            '/filter',
            method='GET')
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))

    def test_post_filter_data(self):
        """Test case for post_filter_data

        Post part of speech filter data.
        """
        body = PosFilter()
        response = self.client.open(
            '/filter',
            method='POST',
            data=json.dumps(body),
            content_type='application/json')
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))


if __name__ == '__main__':
    import unittest
    unittest.main()
