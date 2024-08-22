define([ "require", "utils/Enums", "utils/Utils", "underscore" ], function(require, Enums, Utils) {
    "use strict";
    var UrlLinks = {
        apiBaseUrl: Utils.getBaseUrl(window.location.pathname)
    };
    return _.extend(UrlLinks, {
        baseUrl: UrlLinks.apiBaseUrl + "/api/atlas",
        baseUrlV2: UrlLinks.apiBaseUrl + "/api/atlas/v2",
        typedefsUrl: function() {
            return {
                defs: this.baseUrlV2 + "/types/typedefs",
                def: this.baseUrlV2 + "/types/typedef"
            };
        },
        entitiesDefApiUrl: function(name) {
            return this.getDefApiUrl("entity", name);
        },
        classificationDefApiUrl: function(name) {
            return this.getDefApiUrl("classification", name);
        },
        businessMetadataDefApiUrl: function(name) {
            return this.getDefApiUrl("business_metadata", name);
        },
        enumDefApiUrl: function(name) {
            return this.getDefApiUrl("enum", name);
        },
        relationshipDefApiUrl: function() {
            return this.getDefApiUrl("relationship", name);
        },
        metricsApiUrl: function() {
            return this.baseUrl + "/admin/metrics";
        },
        metricsAllCollectionTimeApiUrl: function() {
            return this.baseUrl + "/admin/metricsstats";
        },
        metricsCollectionTimeApiUrl: function() {
            return this.baseUrl + "/admin/metricsstat/";
        },
        metricsGraphUrl: function() {
            return this.baseUrl + "/admin/metricsstats/charts";
        },
        pendingTaskApiUrl: function() {
            return this.baseUrl + "/admin/tasks";
        },
        debugMetricsApiUrl: function() {
            return this.baseUrl + "/admin/debug/metrics";
        },
        migrationStatusApiUrl: function() {
            return this.baseUrl + "/admin/status";
        },
        rootEntityDefUrl: function(name) {
            return this.baseUrlV2 + "/types/entitydef/name/" + name;
        },
        rootClassificationDefUrl: function(name) {
            return this.baseUrlV2 + "/types/classificationdef/name/" + name;
        },
        getDefApiUrl: function(type, name) {
            var defUrl, defApiUrl = this.typedefsUrl();
            return defUrl = name ? defApiUrl.def + "/name/" + name : defApiUrl.defs, type ? defUrl += "?type=" + type : defUrl;
        },
        entitiesApiUrl: function(options) {
            var entitiesUrl = this.baseUrlV2 + "/entity";
            if (options) {
                var guid = options.guid, associatedGuid = options.associatedGuid, name = options.name, minExtInfo = options.minExtInfo;
                if (guid && name && associatedGuid) return entitiesUrl + "/guid/" + guid + "/classification/" + name + "?associatedEntityGuid=" + associatedGuid;
                guid && name ? entitiesUrl += "/guid/" + guid + "/classification/" + name : guid && !name && (entitiesUrl += "/guid/" + guid);
            }
            return minExtInfo ? entitiesUrl += "?minExtInfo=" + minExtInfo : entitiesUrl;
        },
        relationApiUrl: function(options) {
            var relationsUrl = this.baseUrlV2 + "/relationship";
            if (options) {
                var guid = options.guid;
                options.name;
                guid && (relationsUrl += "/guid/" + guid);
            }
            return relationsUrl;
        },
        entityLabelsAPIUrl: function(guid) {
            return this.entitiesApiUrl({
                guid: guid
            }) + "/labels";
        },
        entityHeaderApiUrl: function(guid) {
            return this.entitiesApiUrl({
                guid: guid
            }) + "/header";
        },
        entitiesTraitsApiUrl: function(token) {
            return token ? this.baseUrlV2 + "/entity/guid/" + token + "/classifications" : this.baseUrlV2 + "/entity/bulk/classification";
        },
        entitiesBusinessMetadataApiUrl: function(guid) {
            if (guid) return this.baseUrlV2 + "/entity/guid/" + guid + "/businessmetadata?isOverwrite=true";
        },
        entityCollectionaudit: function(guid) {
            return this.baseUrlV2 + "/entity/" + guid + "/audit";
        },
        expimpAudit: function(options) {
            var url = this.baseUrl + "/admin/expimp/audit", queryParam = [];
            if (options) var serverName = options.serverName, limit = options.limit, offset = options.offset;
            return serverName && queryParam.push("serverName=" + serverName), limit && queryParam.push("limit=" + limit), 
            offset && queryParam.push("offset=" + offset), queryParam.length > 0 && (url = url + "?" + queryParam.join("&")), 
            url;
        },
        classicationApiUrl: function(name, guid) {
            var typeUrl = this.typedefsUrl();
            return name ? typeUrl.def + "/name/" + name + "?type=classification" : guid ? typeUrl.def + "/guid/" + guid + "?type=classification" : void 0;
        },
        typesApiUrl: function() {
            return this.typedefsUrl().defs + "/headers?excludeInternalTypesAndReferences=true";
        },
        lineageApiUrl: function(guid) {
            var lineageUrl = this.baseUrlV2 + "/lineage";
            return guid ? lineageUrl + "/" + guid : lineageUrl;
        },
        relationshipApiUrl: function(guid) {
            var relationshipUrl = this.baseUrlV2 + "/relationship";
            return guid ? relationshipUrl + "/guid/" + guid + "?extendedInfo=true" : relationshipUrl;
        },
        relationshipSearchApiUrl: function() {
            return this.baseUrlV2 + "/search/relations";
        },
        schemaApiUrl: function(guid) {
            var lineageUrl = this.baseUrl + "/lineage";
            return guid ? lineageUrl + "/" + guid + "/schema" : lineageUrl;
        },
        searchApiUrl: function(searchtype) {
            var searchUrl = this.baseUrlV2 + "/search";
            return searchtype ? searchUrl + "/" + searchtype : searchUrl;
        },
        saveSearchApiUrl: function(saveSearchType) {
            var saveSearchUrl = this.searchApiUrl() + "/saved";
            return saveSearchType ? saveSearchUrl + "/" + saveSearchType : saveSearchUrl;
        },
        glossaryApiUrl: function(options) {
            var guid = options && options.guid, glossaryUrl = this.baseUrlV2 + "/glossary";
            return guid ? glossaryUrl + "/" + guid : glossaryUrl;
        },
        glossaryImportTempUrl: function() {
            return this.glossaryApiUrl() + "/import/template";
        },
        glossaryImportUrl: function() {
            return this.glossaryApiUrl() + "/import";
        },
        businessMetadataImportTempUrl: function() {
            return this.entitiesApiUrl() + "/businessmetadata/import/template";
        },
        businessMetadataImportUrl: function() {
            return this.entitiesApiUrl() + "/businessmetadata/import";
        },
        apiDocUrl: function() {
            return this.apiBaseUrl + "/apidocs/index.html";
        },
        categoryApiUrl: function(options) {
            var guid = options && options.guid, list = options && options.list, related = options && options.related, categoryUrl = this.glossaryApiUrl() + "/" + (list ? "categories" : "category");
            return guid ? related ? categoryUrl + "/" + guid + "/related" : categoryUrl + "/" + guid : categoryUrl;
        },
        termApiUrl: function(options) {
            var guid = options && options.guid, list = options && options.list, related = options && options.related, termUrl = this.glossaryApiUrl() + "/" + (list ? "terms" : "term");
            return guid ? related ? termUrl + "/" + guid + "/related" : termUrl + "/" + guid : termUrl;
        },
        termToEntityApiUrl: function(guid) {
            var termUrl = this.termApiUrl({
                list: !0
            });
            if (guid) return termUrl + "/" + guid + "/assignedEntities";
        },
        versionApiUrl: function() {
            return this.baseUrl + "/admin/version";
        },
        sessionApiUrl: function() {
            return this.baseUrl + "/admin/session";
        },
        adminApiUrl: function() {
            return this.baseUrl + "/admin/audits";
        }
    }), UrlLinks;
});