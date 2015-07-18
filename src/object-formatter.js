import _ from 'lodash';
import get from 'get-value';
import isObject from 'isobject';

class ObjectFormatter {
	constructor(accessorSymbol='@', defaultValue=void 0) {
		this.accessorSymbol = accessorSymbol;
		this.defaultSymbol = '=';
		this.defaultValue = defaultValue;
	}

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

	_isAccessor(mabyAccessor) {
		return this._isSimpleAccessor(mabyAccessor) || this._isCollectionAccessor(mabyAccessor);
	}
	_isSimpleAccessor(mabyAccessor) {
		if (!_.isString(mabyAccessor)) return false;
		return _.startsWith(mabyAccessor, this.accessorSymbol);
	}
	_isCollectionAccessor(mabyAccessor) {
		if (!_.isArray(mabyAccessor)) return false;
		if (mabyAccessor.length !== 2) return false;
		if (!this._isSimpleAccessor(mabyAccessor[0])) return false;
		if (this._isSimpleAccessor(mabyAccessor[1])) return true;
		if (!isObject(mabyAccessor[1])) return false;
		return true;
	}

	_getValueWithAccessor(accessor, object) {
		if (this._isSimpleAccessor(accessor)) return this._getValueWithSimpleAccessor(accessor, object);
		if (this._isCollectionAccessor(accessor)) return this._getValueWithCollectionAccessor(accessor, object);
		return this.defaultValue;
	}
	_getValueWithSimpleAccessor(simpleAccessor, object) {
		var temporaryDefaultValue = this._getDefaultValueFromSimpleAccessor(simpleAccessor);
		var path = this._getPathFromSimpleAccessor(simpleAccessor);
		var value = get(object, path);
		if (_.isUndefined(value)) return temporaryDefaultValue;
		return value;
	}
	_isCollectionReturned(simpleAccessor, object) {
		var path = this._getPathFromSimpleAccessor(simpleAccessor);
		var value = get(object, path);
		if (_.isUndefined(value)) return false;
		return _.isArray(value);
	}
	_getValueWithCollectionAccessor(collectionAccessor, object) {
		var collectionPath = collectionAccessor[0];
		var mapPath = collectionAccessor[1];
		var collection = this._getValueWithSimpleAccessor(collectionPath, object);
		if (!this._isCollectionReturned(collectionPath, object)) return collection;
		if (this._isSimpleAccessor(mapPath)) return this._getArrayValueWithCollection(mapPath, collection);
		if (isObject(mapPath)) return this._getCollectionValueWithCollection(mapPath, collection);
	}
	_getArrayValueWithCollection(simpleAccessor, collection) {
		return _.map(collection, object => {
			return this._getValueWithAccessor(simpleAccessor, object);
		});
	}
	_getCollectionValueWithCollection(schemaObject, collection) {
		return _.map(collection, object => {
			return this.format(schemaObject, object);
		});
	}

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

	_getPathFromSimpleAccessor(simpleAccessor) {
		return simpleAccessor.split(this.defaultSymbol)[0].slice(this.accessorSymbol.length);
	}
}

export default ObjectFormatter;
