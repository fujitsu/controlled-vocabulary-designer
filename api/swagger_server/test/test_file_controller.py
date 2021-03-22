"""
test_file_controller.py COPYRIGHT FUJITSU LIMITED 2021
"""
# coding: utf-8

from __future__ import absolute_import

from flask import json
from six import BytesIO

from swagger_server.models.check_error_response import CheckErrorResponse  # noqa: E501
from swagger_server.models.error_response import ErrorResponse  # noqa: E501
from swagger_server.models.success_response import SuccessResponse  # noqa: E501
from swagger_server.test import BaseTestCase


class TestFileController(BaseTestCase):
    """FileController integration test stubs"""

    def test_download_file(self):
        """Test case for download_file

        Download the file from the server
        """
        query_string = [('out_format', 'out_format_example')]
        response = self.client.open(
            '/download/{file_type}'.format(file_type='file_type_example'),
            method='GET',
            query_string=query_string)
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))

    def test_upload_file(self):
        """Test case for upload_file

        Upload the file to the server
        """
        data = dict(editing_vocabulary='editing_vocabulary_example',
                    reference_vocabulary1='reference_vocabulary1_example',
                    reference_vocabulary2='reference_vocabulary2_example',
                    reference_vocabulary3='reference_vocabulary3_example',
                    example_phrases='example_phrases_example')
        response = self.client.open(
            '/upload',
            method='POST',
            data=data,
            content_type='multipart/form-data')
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))


if __name__ == '__main__':
    import unittest
    unittest.main()
