import _ from 'lodash';
import get from 'recursive-get';
import isObject from 'isobject';

class ObjectFormatter {
	constructor(accessorSymbol='@', defaultValue=void 0) {
		this.accessorSymbol = accessorSymbol;
		this.defaultSymbol = '=';
		this.defaultValue = defaultValue;
	}

	/**
	 * format object to schema
	 * @param  {Object} schema - format schema object
	 * @param  {Object} object - target object
	 * @return {Object} - formatted object
	 */
	format(schema, object) {
		var formatted = {};

		_.each(schema, (value, key) => {
			if (isObject(value)) {
				formatted[key] = this.format(value, object);
			} else if (!this._isAccessor(value)) {
				formatted[key] = value;
			} else {
				formatted[key] = this._getValueWithAccessor(value, object);
			}
		});
		return formatted;
	}

	/**
	 * check accessor is valid any kind of Accessor or not
	 * @param  {any} mabyAccessor
	 * @return {Boolean} - true if arg is any kind of Accessor
	 */
	_isAccessor(mabyAccessor) {
		return this._isSimpleAccessor(mabyAccessor) || this._isCollectionAccessor(mabyAccessor);
	}
	/**
	 * check accessor is valid SimpleAccessor or not
	 * @param  {any}  mabyAccessor
	 * @return {Boolean} - true if arg is SimpleAccessor
	 */
	_isSimpleAccessor(mabyAccessor) {
		if (!_.isString(mabyAccessor)) return false;
		return _.startsWith(mabyAccessor, this.accessorSymbol);
	}
	/**
	 * check accessor is valid CollectionAccessor or not
	 * @param  {any}  mabyAccessor
	 * @return {Boolean} - true if arg is CollectionAccessor
	 */
	_isCollectionAccessor(mabyAccessor) {
		if (!_.isArray(mabyAccessor)) return false;
		if (mabyAccessor.length !== 2) return false;
		if (!this._isSimpleAccessor(mabyAccessor[0])) return false;
		if (this._isSimpleAccessor(mabyAccessor[1])) return true;
		if (!isObject(mabyAccessor[1])) return false;
		return true;
	}

	/**
	 * get object's value using any kind of Accessor
	 * @param  {Accessor} accessor - Simple/Collection Accessor
	 * @param  {Object} object - target object to get value
	 * @return {any|undefined} - the value or undefined when accessor's path doesn't exist
	 */
	_getValueWithAccessor(accessor, object) {
		if (this._isSimpleAccessor(accessor)) return this._getValueWithSimpleAccessor(accessor, object);
		if (this._isCollectionAccessor(accessor)) return this._getValueWithCollectionAccessor(accessor, object);
		return this.defaultValue;
	}
	/**
	 * get object's value using SimpleAccessor
	 * @param  {SimpleAccessor} simpleAccessor
	 * @param  {Object} object - target object to get value
	 * @return {any|undefined} - the value or undefined when accessor's path doesn't exist
	 */
	_getValueWithSimpleAccessor(simpleAccessor, object) {
		var temporaryDefaultValue = this._getDefaultValueFromSimpleAccessor(simpleAccessor);
		var path = this._getPathFromSimpleAccessor(simpleAccessor);
		var value = get(object, path);
		if (_.isUndefined(value)) return temporaryDefaultValue;
		return value;
	}
	/**
	 * get object's value using CollectionAccessor
	 * @param  {CollectionAccessor} collectionAccessor
	 * @param  {Object} object - target object to get value
	 * @return {any|undefined} - the value or undefined when accessor's path doesn't exist
	 */
	_getValueWithCollectionAccessor(collectionAccessor, object) {
		var collectionPath = collectionAccessor[0];
		var mapPath = collectionAccessor[1];
		var collection = this._getValueWithSimpleAccessor(collectionPath, object);
		if (!this._isCollectionReturned(collectionPath, object)) return collection;
		if (this._isSimpleAccessor(mapPath)) return this._getArrayValueWithCollection(mapPath, collection);
		if (isObject(mapPath)) return this._getCollectionValueWithCollection(mapPath, collection);
	}

	/**
	 * check the value is collection or not
	 * @param  {SimpleAccessor} simpleAccessor - SimpleAccessor of path to maybe collection
	 * @param  {Object} object - target object to get value
	 * @return {Boolean} - true if SimpleAccessor's path is path to collection
	 */
	_isCollectionReturned(simpleAccessor, object) {
		var path = this._getPathFromSimpleAccessor(simpleAccessor);
		var value = get(object, path);
		if (_.isUndefined(value)) return false;
		return _.isArray(value);
	}

	/**
	 * get arrayed value from collection
	 * @param  {SimpleAccessor} simpleAccessor - path to returned values from collection's elements
	 * @param  {Object[]} collection - target collection to get values
	 * @return {any[]|undefined[]} - the array of value or undefined when accessor's path doesn't exist on collection's elements
	 */
	_getArrayValueWithCollection(simpleAccessor, collection) {
		return _.map(collection, object => {
			return this._getValueWithAccessor(simpleAccessor, object);
		});
	}
	/**
	 * get arrayed object from collection
	 * @param  {Object} schemaObject - schema of returned objects from collection's elements
	 * @param  {Object[]} collection - target collection to get values
	 * @return {Object[]} - the array of objects picked from collection
	 */
	_getCollectionValueWithCollection(schemaObject, collection) {
		return _.map(collection, object => {
			return this.format(schemaObject, object);
		});
	}

	/**
	 * get current default value
	 * @param  {SimpleAccessor} simpleAccessor
	 * @return {any} - returns current default value (`=` notated temporary default or global default)
	 */
	_getDefaultValueFromSimpleAccessor(simpleAccessor) {
		var splitted = simpleAccessor.split(this.defaultSymbol);
		if (splitted.length !== 2) return this.defaultValue;
		var stringedDefaultValue = splitted[1];
		try {
			var result;
			eval('result=' + stringedDefaultValue); // TODO: don't use eval
			return result;
		} catch(e) {
			return this.defaultValue;
		}
	}

	/**
	 * get path string joined with `.`
	 * @param  {simpleAccessor} simpleAccessor
	 * @return {string} - path string e.g) "a.b.c"
	 */
	_getPathFromSimpleAccessor(simpleAccessor) {
		return simpleAccessor.split(this.defaultSymbol)[0].slice(this.accessorSymbol.length);
	}
}

export default ObjectFormatter;
