"""
editing_vocabulary.py COPYRIGHT FUJITSU LIMITED 2021
"""
# coding: utf-8

from __future__ import absolute_import
from datetime import date, datetime  # noqa: F401

from typing import List, Dict  # noqa: F401

from swagger_server.models.base_model_ import Model
from swagger_server import util


class EditingVocabulary(Model):
    """NOTE: This class is auto generated by the swagger code generator program.

    Do not edit the class manually.
    """
    def __init__(self, id: int=None, term: str=None, preferred_label: str=None, language: str=None, uri: str=None, broader_uri: str=None, synonym: List[str]=None, other_voc_syn_uri: str=None, term_description: str=None, created_time: str=None, modified_time: str=None, synonym_candidate: List[str]=None, broader_term_candidate: List[str]=None, hidden: bool=None, postion_x: str=None, postion_y: str=None, color1: str=None, color2: str=None, external_voc: bool=None):  # noqa: E501
        """EditingVocabulary - a model defined in Swagger

        :param id: The id of this EditingVocabulary.  # noqa: E501
        :type id: int
        :param term: The term of this EditingVocabulary.  # noqa: E501
        :type term: str
        :param preferred_label: The preferred_label of this EditingVocabulary.  # noqa: E501
        :type preferred_label: str
        :param language: The language of this EditingVocabulary.  # noqa: E501
        :type language: str
        :param uri: The uri of this EditingVocabulary.  # noqa: E501
        :type uri: str
        :param broader_uri: The broader_uri of this EditingVocabulary.  # noqa: E501
        :type broader_uri: str
        :param synonym: The synonym of this EditingVocabulary.  # noqa: E501
        :type synonym: List[str]
        :param other_voc_syn_uri: The other_voc_syn_uri of this EditingVocabulary.  # noqa: E501
        :type other_voc_syn_uri: str
        :param term_description: The term_description of this EditingVocabulary.  # noqa: E501
        :type term_description: str
        :param created_time: The created_time of this EditingVocabulary.  # noqa: E501
        :type created_time: str
        :param modified_time: The modified_time of this EditingVocabulary.  # noqa: E501
        :type modified_time: str
        :param synonym_candidate: The synonym_candidate of this EditingVocabulary.  # noqa: E501
        :type synonym_candidate: List[str]
        :param broader_term_candidate: The broader_term_candidate of this EditingVocabulary.  # noqa: E501
        :type broader_term_candidate: List[str]
        :param hidden: The hidden of this EditingVocabulary.  # noqa: E501
        :type hidden: bool
        :param postion_x: The postion_x of this EditingVocabulary.  # noqa: E501
        :type postion_x: str
        :param postion_y: The postion_y of this EditingVocabulary.  # noqa: E501
        :type postion_y: str
        :param color1: The color1 of this EditingVocabulary.  # noqa: E501
        :type color1: str
        :param color2: The color2 of this EditingVocabulary.  # noqa: E501
        :type color2: str
        :param external_voc: The external_voc of this EditingVocabulary.  # noqa: E501
        :type external_voc: bool
        """
        self.swagger_types = {
            'id': int,
            'term': str,
            'preferred_label': str,
            'language': str,
            'uri': str,
            'broader_uri': str,
            'synonym': List[str],
            'other_voc_syn_uri': str,
            'term_description': str,
            'created_time': str,
            'modified_time': str,
            'synonym_candidate': List[str],
            'broader_term_candidate': List[str],
            'hidden': bool,
            'postion_x': str,
            'postion_y': str,
            'color1': str,
            'color2': str,
            'external_voc': bool
        }

        self.attribute_map = {
            'id': 'id',
            'term': 'term',
            'preferred_label': 'preferred_label',
            'language': 'language',
            'uri': 'uri',
            'broader_uri': 'broader_uri',
            'synonym': 'synonym',
            'other_voc_syn_uri': 'other_voc_syn_uri',
            'term_description': 'term_description',
            'created_time': 'created_time',
            'modified_time': 'modified_time',
            'synonym_candidate': 'synonym_candidate',
            'broader_term_candidate': 'broader_term_candidate',
            'hidden': 'hidden',
            'postion_x': 'postion_x',
            'postion_y': 'postion_y',
            'color1': 'color1',
            'color2': 'color2',
            'external_voc': 'external_voc'
        }
        self._id = id
        self._term = term
        self._preferred_label = preferred_label
        self._language = language
        self._uri = uri
        self._broader_uri = broader_uri
        self._synonym = synonym
        self._other_voc_syn_uri = other_voc_syn_uri
        self._term_description = term_description
        self._created_time = created_time
        self._modified_time = modified_time
        self._synonym_candidate = synonym_candidate
        self._broader_term_candidate = broader_term_candidate
        self._hidden = hidden
        self._postion_x = postion_x
        self._postion_y = postion_y
        self._color1 = color1
        self._color2 = color2
        self._external_voc = external_voc

    @classmethod
    def from_dict(cls, dikt) -> 'EditingVocabulary':
        """Returns the dict as a model

        :param dikt: A dict.
        :type: dict
        :return: The EditingVocabulary of this EditingVocabulary.  # noqa: E501
        :rtype: EditingVocabulary
        """
        return util.deserialize_model(dikt, cls)

    @property
    def id(self) -> int:
        """Gets the id of this EditingVocabulary.


        :return: The id of this EditingVocabulary.
        :rtype: int
        """
        return self._id

    @id.setter
    def id(self, id: int):
        """Sets the id of this EditingVocabulary.


        :param id: The id of this EditingVocabulary.
        :type id: int
        """

        self._id = id

    @property
    def term(self) -> str:
        """Gets the term of this EditingVocabulary.


        :return: The term of this EditingVocabulary.
        :rtype: str
        """
        return self._term

    @term.setter
    def term(self, term: str):
        """Sets the term of this EditingVocabulary.


        :param term: The term of this EditingVocabulary.
        :type term: str
        """

        self._term = term

    @property
    def preferred_label(self) -> str:
        """Gets the preferred_label of this EditingVocabulary.


        :return: The preferred_label of this EditingVocabulary.
        :rtype: str
        """
        return self._preferred_label

    @preferred_label.setter
    def preferred_label(self, preferred_label: str):
        """Sets the preferred_label of this EditingVocabulary.


        :param preferred_label: The preferred_label of this EditingVocabulary.
        :type preferred_label: str
        """

        self._preferred_label = preferred_label

    @property
    def language(self) -> str:
        """Gets the language of this EditingVocabulary.


        :return: The language of this EditingVocabulary.
        :rtype: str
        """
        return self._language

    @language.setter
    def language(self, language: str):
        """Sets the language of this EditingVocabulary.


        :param language: The language of this EditingVocabulary.
        :type language: str
        """

        self._language = language

    @property
    def uri(self) -> str:
        """Gets the uri of this EditingVocabulary.


        :return: The uri of this EditingVocabulary.
        :rtype: str
        """
        return self._uri

    @uri.setter
    def uri(self, uri: str):
        """Sets the uri of this EditingVocabulary.


        :param uri: The uri of this EditingVocabulary.
        :type uri: str
        """

        self._uri = uri

    @property
    def broader_uri(self) -> str:
        """Gets the broader_uri of this EditingVocabulary.


        :return: The broader_uri of this EditingVocabulary.
        :rtype: str
        """
        return self._broader_uri

    @broader_uri.setter
    def broader_uri(self, broader_uri: str):
        """Sets the broader_uri of this EditingVocabulary.


        :param broader_uri: The broader_uri of this EditingVocabulary.
        :type broader_uri: str
        """

        self._broader_uri = broader_uri

    @property
    def synonym(self) -> List[str]:
        """Gets the synonym of this EditingVocabulary.


        :return: The synonym of this EditingVocabulary.
        :rtype: List[str]
        """
        return self._synonym

    @synonym.setter
    def synonym(self, synonym: List[str]):
        """Sets the synonym of this EditingVocabulary.


        :param synonym: The synonym of this EditingVocabulary.
        :type synonym: List[str]
        """

        self._synonym = synonym

    @property
    def other_voc_syn_uri(self) -> str:
        """Gets the other_voc_syn_uri of this EditingVocabulary.


        :return: The other_voc_syn_uri of this EditingVocabulary.
        :rtype: str
        """
        return self._other_voc_syn_uri

    @other_voc_syn_uri.setter
    def other_voc_syn_uri(self, other_voc_syn_uri: str):
        """Sets the other_voc_syn_uri of this EditingVocabulary.


        :param other_voc_syn_uri: The other_voc_syn_uri of this EditingVocabulary.
        :type other_voc_syn_uri: str
        """

        self._other_voc_syn_uri = other_voc_syn_uri

    @property
    def term_description(self) -> str:
        """Gets the term_description of this EditingVocabulary.


        :return: The term_description of this EditingVocabulary.
        :rtype: str
        """
        return self._term_description

    @term_description.setter
    def term_description(self, term_description: str):
        """Sets the term_description of this EditingVocabulary.


        :param term_description: The term_description of this EditingVocabulary.
        :type term_description: str
        """

        self._term_description = term_description

    @property
    def created_time(self) -> str:
        """Gets the created_time of this EditingVocabulary.


        :return: The created_time of this EditingVocabulary.
        :rtype: str
        """
        return self._created_time

    @created_time.setter
    def created_time(self, created_time: str):
        """Sets the created_time of this EditingVocabulary.


        :param created_time: The created_time of this EditingVocabulary.
        :type created_time: str
        """

        self._created_time = created_time

    @property
    def modified_time(self) -> str:
        """Gets the modified_time of this EditingVocabulary.


        :return: The modified_time of this EditingVocabulary.
        :rtype: str
        """
        return self._modified_time

    @modified_time.setter
    def modified_time(self, modified_time: str):
        """Sets the modified_time of this EditingVocabulary.


        :param modified_time: The modified_time of this EditingVocabulary.
        :type modified_time: str
        """

        self._modified_time = modified_time

    @property
    def synonym_candidate(self) -> List[str]:
        """Gets the synonym_candidate of this EditingVocabulary.


        :return: The synonym_candidate of this EditingVocabulary.
        :rtype: List[str]
        """
        return self._synonym_candidate

    @synonym_candidate.setter
    def synonym_candidate(self, synonym_candidate: List[str]):
        """Sets the synonym_candidate of this EditingVocabulary.


        :param synonym_candidate: The synonym_candidate of this EditingVocabulary.
        :type synonym_candidate: List[str]
        """

        self._synonym_candidate = synonym_candidate

    @property
    def broader_term_candidate(self) -> List[str]:
        """Gets the broader_term_candidate of this EditingVocabulary.


        :return: The broader_term_candidate of this EditingVocabulary.
        :rtype: List[str]
        """
        return self._broader_term_candidate

    @broader_term_candidate.setter
    def broader_term_candidate(self, broader_term_candidate: List[str]):
        """Sets the broader_term_candidate of this EditingVocabulary.


        :param broader_term_candidate: The broader_term_candidate of this EditingVocabulary.
        :type broader_term_candidate: List[str]
        """

        self._broader_term_candidate = broader_term_candidate

    @property
    def hidden(self) -> bool:
        """Gets the hidden of this EditingVocabulary.


        :return: The hidden of this EditingVocabulary.
        :rtype: bool
        """
        return self._hidden

    @hidden.setter
    def hidden(self, hidden: bool):
        """Sets the hidden of this EditingVocabulary.


        :param hidden: The hidden of this EditingVocabulary.
        :type hidden: bool
        """

        self._hidden = hidden


    @property
    def postion_x(self) -> str:
        """Gets the postion_x of this EditingVocabulary.


        :return: The postion_x of this EditingVocabulary.
        :rtype: str
        """
        return self._postion_x

    @postion_x.setter
    def postion_x(self, postion_x: str):
        """Sets the postion_x of this EditingVocabulary.


        :param postion_x: The postion_x of this EditingVocabulary.
        :type postion_x: str
        """

        self._postion_x = postion_x

    @property
    def postion_y(self) -> str:
        """Gets the postion_y of this EditingVocabulary.


        :return: The postion_y of this EditingVocabulary.
        :rtype: str
        """
        return self._postion_y

    @postion_y.setter
    def postion_y(self, postion_y: str):
        """Sets the postion_y of this EditingVocabulary.


        :param postion_y: The postion_y of this EditingVocabulary.
        :type postion_y: str
        """

        self._postion_y = postion_y

    @property
    def color1(self) -> str:
        """Gets the color1 of this EditingVocabulary.


        :return: The color1 of this EditingVocabulary.
        :rtype: str
        """
        return self._color1

    @color1.setter
    def color1(self, color1: str):
        """Sets the color1 of this EditingVocabulary.


        :param color1: The color1 of this EditingVocabulary.
        :type color1: str
        """

        self._color1 = color1

    @property
    def color2(self) -> str:
        """Gets the color2 of this EditingVocabulary.


        :return: The color2 of this EditingVocabulary.
        :rtype: str
        """
        return self._color2

    @color2.setter
    def color2(self, color2: str):
        """Sets the color2 of this EditingVocabulary.


        :param color2: The color2 of this EditingVocabulary.
        :type color2: str
        """

        self._color2 = color2
        
    @property
    def external_voc(self) -> bool:
        """Gets the external_voc of this EditingVocabulary.


        :return: The external_voc of this EditingVocabulary.
        :rtype: bool
        """
        return self._external_voc

    @external_voc.setter
    def external_voc(self, external_voc: bool):
        """Sets the external_voc of this EditingVocabulary.


        :param external_voc: The external_voc of this EditingVocabulary.
        :type external_voc: bool
        """

        self._external_voc = external_voc