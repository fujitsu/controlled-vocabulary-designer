"""
editing_vocabulary_meta.py COPYRIGHT FUJITSU LIMITED 2021
"""
# coding: utf-8

from __future__ import absolute_import
from datetime import date, datetime  # noqa: F401

from typing import List, Dict  # noqa: F401

from swagger_server.models.base_model_ import Model
from swagger_server import util


class EditingVocabularyMeta(Model):
    """NOTE: This class is auto generated by the swagger code generator program.

    Do not edit the class manually.
    """
    def __init__(self, id: int=None, meta_name: str=None, meta_enname: str=None, meta_version: str=None, meta_prefix: str=None, meta_uri: str=None, meta_description: str=None, meta_endescription: str=None, meta_author: str=None):  # noqa: E501
        """EditingVocabularyMeta - a model defined in Swagger

        :param id: The id of this EditingVocabularyMeta.  # noqa: E501
        :type id: int
        :param meta_name: The meta_name of this EditingVocabularyMeta.  # noqa: E501
        :type meta_name: str
        :param meta_enname: The  meta_enname of this EditingVocabularyMeta.  # noqa: E501
        :type  meta_enname: str
        :param meta_version: The meta_version of this EditingVocabularyMeta.  # noqa: E501
        :type meta_version: str
        :param meta_prefix: The meta_prefix of this EditingVocabularyMeta.  # noqa: E501
        :type meta_prefix: str
        :param meta_uri: The meta_uri of this EditingVocabularyMeta.  # noqa: E501
        :type meta_uri: str
        :param meta_description: The meta_description of this EditingVocabularyMeta.  # noqa: E501
        :type meta_description: str
        :param meta_endescription: The meta_endescription of this EditingVocabularyMeta.  # noqa: E501
        :type meta_endescription: str
        :param meta_author: The meta_author of this EditingVocabularyMeta.  # noqa: E501
        :type meta_author: str
        """
        self.swagger_types = {
            'id': int,
            'meta_name': str,
            'meta_enname': str,
            'meta_version': str,
            'meta_prefix': str,
            'meta_uri': str,
            'meta_description': str,
            'meta_endescription': str,
            'meta_author': str
        }

        self.attribute_map = {
            'id': 'id',
            'meta_name': 'meta_name',
            'meta_enname': 'meta_enname',
            'meta_version': 'meta_version',
            'meta_prefix': 'meta_prefix',
            'meta_uri': 'meta_uri',
            'meta_description': 'meta_description',
            'meta_endescription': 'meta_endescription',
            'meta_author': 'meta_author'
        }
        self._id = id
        self._meta_name = meta_name
        self._meta_enname = meta_enname
        self._meta_version = meta_version
        self._meta_prefix = meta_prefix
        self._meta_uri = meta_uri
        self._meta_description = meta_description
        self._meta_endescription = meta_endescription
        self._meta_author = meta_author
       

    @classmethod
    def from_dict(cls, dikt) -> 'EditingVocabularyMeta':
        """Returns the dict as a model

        :param dikt: A dict.
        :type: dict
        :return: The EditingVocabularyMeta of this EditingVocabularyMeta.  # noqa: E501
        :rtype: EditingVocabularyMeta
        """
        return util.deserialize_model(dikt, cls)

    @property
    def id(self) -> int:
        """Gets the id of this EditingVocabularyMeta.


        :return: The id of this EditingVocabularyMeta.
        :rtype: int
        """
        return self._id

    @id.setter
    def id(self, id: int):
        """Sets the id of this EditingVocabularyMeta.


        :param id: The id of this EditingVocabularyMeta.
        :type id: int
        """

        self._id = id

    @property
    def meta_name(self) -> str:
        """Gets the meta_name of this EditingVocabularyMeta.


        :return: The meta_name of this EditingVocabularyMeta.
        :rtype: str
        """
        return self._meta_name

    @meta_name.setter
    def meta_name(self, meta_name: str):
        """Sets the meta_name of this EditingVocabularyMeta.


        :param meta_name: The meta_name of this EditingVocabularyMeta.
        :type meta_name: str
        """

        self._meta_name = meta_name

    @property
    def meta_enname(self) -> str:
        """Gets the meta_enname of this EditingVocabularyMeta.


        :return: The meta_enname of this EditingVocabularyMeta.
        :rtype: str
        """
        return self._meta_enname

    @meta_enname.setter
    def meta_enname(self, meta_enname: str):
        """Sets the meta_enname of this EditingVocabularyMeta.


        :param meta_enname: The meta_enname of this EditingVocabularyMeta.
        :type meta_enname: str
        """

        self._meta_enname = meta_enname

    @property
    def meta_version(self) -> str:
        """Gets the meta_version of this EditingVocabularyMeta.


        :return: The meta_version of this EditingVocabularyMeta.
        :rtype: str
        """
        return self._meta_version

    @meta_version.setter
    def meta_version(self, meta_version: str):
        """Sets the meta_version of this EditingVocabularyMeta.


        :param meta_version: The meta_version of this EditingVocabularyMeta.
        :type meta_version: str
        """

        self._meta_version = meta_version

    @property
    def meta_prefix(self) -> str:
        """Gets the meta_prefix of this EditingVocabularyMeta.


        :return: The meta_prefix of this EditingVocabularyMeta.
        :rtype: str
        """
        return self._meta_prefix

    @meta_prefix.setter
    def meta_prefix(self, meta_prefix: str):
        """Sets the meta_prefix of this EditingVocabularyMeta.


        :param meta_prefix: The meta_prefix of this EditingVocabularyMeta.
        :type meta_prefix: str
        """

        self._meta_prefix = meta_prefix

    @property
    def meta_uri(self) -> str:
        """Gets the meta_uri of this EditingVocabularyMeta.


        :return: The meta_uri of this EditingVocabularyMeta.
        :rtype: str
        """
        return self._meta_uri

    @meta_uri.setter
    def meta_uri(self, meta_uri: str):
        """Sets the meta_uri of this EditingVocabularyMeta.


        :param meta_uri: The meta_uri of this EditingVocabularyMeta.
        :type meta_uri: str
        """

        self._meta_uri = meta_uri

    @property
    def meta_description(self) -> str:
        """Gets the meta_description of this EditingVocabularyMeta.


        :return: The meta_description of this EditingVocabularyMeta.
        :rtype: str
        """
        return self._meta_description

    @meta_description.setter
    def meta_description(self, meta_description: str):
        """Sets the meta_description of this EditingVocabularyMeta.


        :param meta_description: The meta_description of this EditingVocabularyMeta.
        :type meta_description: str
        """

        self._meta_description = meta_description

    @property
    def meta_endescription(self) -> str:
        """Gets the meta_endescription of this EditingVocabularyMeta.


        :return: The meta_endescription of this EditingVocabularyMeta.
        :rtype: str
        """
        return self._meta_endescription

    @meta_endescription.setter
    def meta_endescription(self, meta_endescription: str):
        """Sets the meta_endescription of this EditingVocabularyMeta.


        :param meta_endescription: The meta_endescription of this EditingVocabularyMeta.
        :type meta_endescription: str
        """

        self._meta_endescription = meta_endescription

    @property
    def meta_author(self) -> str:
        """Gets the meta_author of this EditingVocabularyMeta.


        :return: The meta_author of this EditingVocabularyMeta.
        :rtype: str
        """
        return self._meta_author

    @meta_author.setter
    def meta_author(self, meta_author: str):
        """Sets the meta_author of this EditingVocabularyMeta.


        :param meta_author: The meta_author of this EditingVocabularyMeta.
        :type meta_author: str
        """

        self._meta_author = meta_author
