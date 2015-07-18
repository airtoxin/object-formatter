import _ from 'lodash';
import get from 'get-value';

class ObjectFormatter {
	constructor(accessorSymbol='@', defaultValue=void 0) {
		this.accessorSymbol = accessorSymbol;
		this.defaultSymbol = '=';
		this.defaultValue = defaultValue;
	}

	format(schema, object) {
		var formatted = {};
		_.each(schema, (value, key) => {
			if (!this._isAccessor(value)) {
				formatted[key] = value;
			} else {
				formatted[key] = this._getValueWithAccessor(value, object);
			}
		});
		return formatted;
	}

	_isAccessor(mabyAccessor) {
		if (_.isString(mabyAccessor)) return this._isSimpleAccessor(mabyAccessor);
		if (_.isArray(mabyAccessor)) return this._isCollectionAccessor(mabyAccessor);
		return false;
	}
	_isSimpleAccessor(mabyAccessor) {
		return _.startsWith(mabyAccessor, this.accessorSymbol);
	}
	_isCollectionAccessor(mabyAccessor) {
		if (mabyAccessor.length !== 2) return false;
		if (!this._isSimpleAccessor(mabyAccessor[0])) return false;
		if (this._isSimpleAccessor(mabyAccessor[1])) return true;
		if (!_.isObject(mabyAccessor[1])) return false;
		return this._isAccessor(mabyAccessor[1]);
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
	_getValueWithCollectionAccessor(collectionAccessor, object) {
		var collectionPath = collectionAccessor[0];
		var collection = this._getValueWithSimpleAccessor(collectionPath, object);
		var mapPath = collectionAccessor[1];
		if (this._isSimpleAccessor(mapPath)) return this._getArrayValueWithCollection(mapPath, collection);
		if (_.isObject(mapPath)) return this._getCollectionValueWithCollection(mapPath, collection);
		return collection;
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
		return eval(stringedDefaultValue); // TODO: don't use eval
	}
	// _getDefaultValueFromCollectionAccessor(collectionAccessor) {
	// }

	_getPathFromSimpleAccessor(simpleAccessor) {
		return simpleAccessor.split(this.defaultSymbol)[0].slice(this.accessorSymbol);
	}
}

export default ObjectFormatter;
