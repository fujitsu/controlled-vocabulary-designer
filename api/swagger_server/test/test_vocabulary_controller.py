"""
test_vocabulary_controller.py COPYRIGHT FUJITSU LIMITED 2021
"""
# coding: utf-8

from __future__ import absolute_import

from flask import json
from six import BytesIO

from swagger_server.models.editing_vocabulary import EditingVocabulary  # noqa: E501
from swagger_server.models.error_response import ErrorResponse  # noqa: E501
from swagger_server.models.get_all_success_response import GetAllSuccessResponse  # noqa: E501
from swagger_server.test import BaseTestCase


class TestVocabularyController(BaseTestCase):
    """VocabularyController integration test stubs"""

    def test_delete_vocabulary_term(self):
        """Test case for delete_vocabulary_term

        Delete editing vocabulary term
        """
        body = [56]
        response = self.client.open(
            '/vocabulary/{file_type}'.format(file_type='file_type_example'),
            method='POST',
            data=json.dumps(body),
            content_type='application/json')
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))

    def test_get_vocabulary_data(self):
        """Test case for get_vocabulary_data

        Get vocabulary data by type
        """
        response = self.client.open(
            '/vocabulary/{file_type}'.format(file_type='file_type_example'),
            method='GET')
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))

    def test_get_vocabulary_term(self):
        """Test case for get_vocabulary_term

        Get editing vocabulary term
        """
        response = self.client.open(
            '/vocabulary/{file_type}/{term}'.format(file_type='file_type_example', term='term_example'),
            method='GET')
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))

    def test_post_vocabulary_term(self):
        """Test case for post_vocabulary_term

        Add or Update editing vocabulary terms
        """
        body = [EditingVocabulary()]
        response = self.client.open(
            '/vocabulary/{file_type}/{term}'.format(file_type='file_type_example', term='term_example'),
            method='POST',
            data=json.dumps(body),
            content_type='application/json')
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))


if __name__ == '__main__':
    import unittest
    unittest.main()
