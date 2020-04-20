"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var column_1 = require("./column");
var record_1 = require("./record");
var responsetemplate_1 = require("./responsetemplate");
var Response = (function (_super) {
    __extends(Response, _super);
    function Response(raw, cmd, ph) {
        if (ph === void 0) { ph = {}; }
        var _this = _super.call(this, raw) || this;
        var keys = Object.keys(ph);
        keys.forEach(function (varName) {
            _this.raw = _this.raw.replace(new RegExp("{" + varName + "}", "g"), ph[varName]);
        });
        _this.raw = _this.raw.replace(/\{[A-Z_]+\}/g, "");
        _this = _super.call(this, _this.raw) || this;
        _this.command = cmd;
        if (_this.command &&
            Object.prototype.hasOwnProperty.call(_this.command, "PASSWORD")) {
            _this.command.PASSWORD = "***";
        }
        _this.columnkeys = [];
        _this.columns = [];
        _this.recordIndex = 0;
        _this.records = [];
        if (Object.prototype.hasOwnProperty.call(_this.hash, "PROPERTY")) {
            var colKeys = Object.keys(_this.hash.PROPERTY);
            var count_1 = 0;
            colKeys.forEach(function (c) {
                var d = _this.hash.PROPERTY[c];
                _this.addColumn(c, d);
                if (d.length > count_1) {
                    count_1 = d.length;
                }
            });
            var _loop_1 = function (i) {
                var d = {};
                colKeys.forEach(function (k) {
                    var col = _this.getColumn(k);
                    if (col) {
                        var v = col.getDataByIndex(i);
                        if (v !== null) {
                            d[k] = v;
                        }
                    }
                });
                this_1.addRecord(d);
            };
            var this_1 = this;
            for (var i = 0; i < count_1; i++) {
                _loop_1(i);
            }
        }
        return _this;
    }
    Response.prototype.addColumn = function (key, data) {
        var col = new column_1.Column(key, data);
        this.columns.push(col);
        this.columnkeys.push(key);
        return this;
    };
    Response.prototype.addRecord = function (h) {
        this.records.push(new record_1.Record(h));
        return this;
    };
    Response.prototype.getColumn = function (key) {
        return (this.hasColumn(key) ? this.columns[this.columnkeys.indexOf(key)] : null);
    };
    Response.prototype.getColumnIndex = function (colkey, index) {
        var col = this.getColumn(colkey);
        return col ? col.getDataByIndex(index) : null;
    };
    Response.prototype.getColumnKeys = function () {
        return this.columnkeys;
    };
    Response.prototype.getColumns = function () {
        return this.columns;
    };
    Response.prototype.getCommand = function () {
        return this.command;
    };
    Response.prototype.getCommandPlain = function () {
        var _this = this;
        var tmp = "";
        Object.keys(this.command).forEach(function (key) {
            tmp += key + " = " + _this.command[key] + "\n";
        });
        return tmp;
    };
    Response.prototype.getCurrentPageNumber = function () {
        var first = this.getFirstRecordIndex();
        var limit = this.getRecordsLimitation();
        if (first !== null && limit) {
            return Math.floor(first / limit) + 1;
        }
        return null;
    };
    Response.prototype.getCurrentRecord = function () {
        return this.hasCurrentRecord() ? this.records[this.recordIndex] : null;
    };
    Response.prototype.getFirstRecordIndex = function () {
        var col = this.getColumn("FIRST");
        if (col) {
            var f = col.getDataByIndex(0);
            if (f !== null) {
                return parseInt(f, 10);
            }
        }
        if (this.records.length) {
            return 0;
        }
        return null;
    };
    Response.prototype.getLastRecordIndex = function () {
        var col = this.getColumn("LAST");
        if (col) {
            var l = col.getDataByIndex(0);
            if (l !== null) {
                return parseInt(l, 10);
            }
        }
        var len = this.getRecordsCount();
        if (len) {
            return (len - 1);
        }
        return null;
    };
    Response.prototype.getListHash = function () {
        var lh = [];
        this.getRecords().forEach(function (rec) {
            lh.push(rec.getData());
        });
        return {
            LIST: lh,
            meta: {
                columns: this.getColumnKeys(),
                pg: this.getPagination(),
            },
        };
    };
    Response.prototype.getNextRecord = function () {
        if (this.hasNextRecord()) {
            return this.records[++this.recordIndex];
        }
        return null;
    };
    Response.prototype.getNextPageNumber = function () {
        var cp = this.getCurrentPageNumber();
        if (cp === null) {
            return null;
        }
        var page = cp + 1;
        var pages = this.getNumberOfPages();
        return (page <= pages ? page : pages);
    };
    Response.prototype.getNumberOfPages = function () {
        var t = this.getRecordsTotalCount();
        var limit = this.getRecordsLimitation();
        if (t && limit) {
            return Math.ceil(t / this.getRecordsLimitation());
        }
        return 0;
    };
    Response.prototype.getPagination = function () {
        return {
            COUNT: this.getRecordsCount(),
            CURRENTPAGE: this.getCurrentPageNumber(),
            FIRST: this.getFirstRecordIndex(),
            LAST: this.getLastRecordIndex(),
            LIMIT: this.getRecordsLimitation(),
            NEXTPAGE: this.getNextPageNumber(),
            PAGES: this.getNumberOfPages(),
            PREVIOUSPAGE: this.getPreviousPageNumber(),
            TOTAL: this.getRecordsTotalCount(),
        };
    };
    Response.prototype.getPreviousPageNumber = function () {
        var cp = this.getCurrentPageNumber();
        if (cp === null) {
            return null;
        }
        return (cp - 1) || null;
    };
    Response.prototype.getPreviousRecord = function () {
        if (this.hasPreviousRecord()) {
            return this.records[--this.recordIndex];
        }
        return null;
    };
    Response.prototype.getRecord = function (idx) {
        if (idx >= 0 && this.records.length > idx) {
            return this.records[idx];
        }
        return null;
    };
    Response.prototype.getRecords = function () {
        return this.records;
    };
    Response.prototype.getRecordsCount = function () {
        return this.records.length;
    };
    Response.prototype.getRecordsTotalCount = function () {
        var col = this.getColumn("TOTAL");
        if (col) {
            var t = col.getDataByIndex(0);
            if (t !== null) {
                return parseInt(t, 10);
            }
        }
        return this.getRecordsCount();
    };
    Response.prototype.getRecordsLimitation = function () {
        var col = this.getColumn("LIMIT");
        if (col) {
            var l = col.getDataByIndex(0);
            if (l !== null) {
                return parseInt(l, 10);
            }
        }
        return this.getRecordsCount();
    };
    Response.prototype.hasNextPage = function () {
        var cp = this.getCurrentPageNumber();
        if (cp === null) {
            return false;
        }
        return (cp + 1 <= this.getNumberOfPages());
    };
    Response.prototype.hasPreviousPage = function () {
        var cp = this.getCurrentPageNumber();
        if (cp === null) {
            return false;
        }
        return ((cp - 1) > 0);
    };
    Response.prototype.rewindRecordList = function () {
        this.recordIndex = 0;
        return this;
    };
    Response.prototype.hasColumn = function (key) {
        return (this.columnkeys.indexOf(key) !== -1);
    };
    Response.prototype.hasCurrentRecord = function () {
        var len = this.records.length;
        return (len > 0 &&
            this.recordIndex >= 0 &&
            this.recordIndex < len);
    };
    Response.prototype.hasNextRecord = function () {
        var next = this.recordIndex + 1;
        return (this.hasCurrentRecord() && (next < this.records.length));
    };
    Response.prototype.hasPreviousRecord = function () {
        return (this.recordIndex > 0 && this.hasCurrentRecord());
    };
    return Response;
}(responsetemplate_1.ResponseTemplate));
exports.Response = Response;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzcG9uc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcmVzcG9uc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsbUNBQWtDO0FBQ2xDLG1DQUFrQztBQUNsQyx1REFBc0Q7QUFLdEQ7SUFBOEIsNEJBQWdCO0lBK0IxQyxrQkFBbUIsR0FBVyxFQUFFLEdBQVEsRUFBRSxFQUFZO1FBQVosbUJBQUEsRUFBQSxPQUFZO1FBQXRELFlBRUksa0JBQU0sR0FBRyxDQUFDLFNBK0NiO1FBN0NHLElBQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDN0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFDLE9BQWU7WUFDekIsS0FBSSxDQUFDLEdBQUcsR0FBRyxLQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLE1BQU0sQ0FBQyxNQUFJLE9BQU8sTUFBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQzlFLENBQUMsQ0FBQyxDQUFDO1FBQ0gsS0FBSSxDQUFDLEdBQUcsR0FBRyxLQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFaEQsUUFBQSxrQkFBTSxLQUFJLENBQUMsR0FBRyxDQUFDLFNBQUM7UUFHaEIsS0FBSSxDQUFDLE9BQU8sR0FBRyxHQUFHLENBQUM7UUFDbkIsSUFDSSxLQUFJLENBQUMsT0FBTztZQUNaLE1BQU0sQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxLQUFJLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxFQUNoRTtZQUNFLEtBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztTQUNqQztRQUNELEtBQUksQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDO1FBQ3JCLEtBQUksQ0FBQyxPQUFPLEdBQUcs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UUFDSSxJQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQztRQUNyQixPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBT08sNEJBQVMsR0FBakIsVUFBa0IsR0FBVztRQUN6QixPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNqRCxDQUFDO0lBT08sbUNBQWdCLEdBQXhCO1FBQ0ksSUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7UUFDaEMsT0FBTyxDQUNILEdBQUcsR0FBRyxDQUFDO1lBQ1AsSUFBSSxDQUFDLFdBQVcsSUFBSSxDQUFDO1lBQ3JCLElBQUksQ0FBQyxXQUFXLEdBQUcsR0FBRyxDQUN6QixDQUFDO0lBQ04sQ0FBQztJQU9PLGdDQUFhLEdBQXJCO1FBQ0ksSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUM7UUFDbEMsT0FBTyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUNyRSxDQUFDO0lBT08sb0NBQWlCLEdBQXpCO1FBQ0ksT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUM7SUFDN0QsQ0FBQztJQUNMLGVBQUM7QUFBRCxDQUFDLEFBamNELENBQThCLG1DQUFnQixHQWljN0M7QUFqY1ksNEJBQVEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb2x1bW4gfSBmcm9tIFwiLi9jb2x1bW5cIjtcbmltcG9ydCB7IFJlY29yZCB9IGZyb20gXCIuL3JlY29yZFwiO1xuaW1wb3J0IHsgUmVzcG9uc2VUZW1wbGF0ZSB9IGZyb20gXCIuL3Jlc3BvbnNldGVtcGxhdGVcIjtcblxuLyoqXG4gKiBSZXNwb25zZSBDbGFzcyBpbmhlcml0aW5nIGZyb20gUmVzcG9uc2VUZW1wbGF0ZSBDbGFzc1xuICovXG5leHBvcnQgY2xhc3MgUmVzcG9uc2UgZXh0ZW5kcyBSZXNwb25zZVRlbXBsYXRlIHtcblxuICAgIC8qKlxuICAgICAqIFRoZSBBUEkgQ29tbWFuZCB1c2VkIHdpdGhpbiB0aGlzIHJlcXVlc3RcbiAgICAgKi9cbiAgICBwcml2YXRlIGNvbW1hbmQ6IGFueTtcbiAgICAvKipcbiAgICAgKiBDb2x1bW4gbmFtZXMgYXZhaWxhYmxlIGluIHRoaXMgcmVzcG9uc3NlXG4gICAgICogTk9URTogdGhpcyBpbmNsdWRlcyBhbHNvIEZJUlNULCBMQVNULCBMSU1JVCwgQ09VTlQsIFRPVEFMXG4gICAgICogYW5kIG1heWJlIGZ1cnRoZXIgc3BlY2lmaWMgY29sdW1ucyBpbiBjYXNlIG9mIGEgbGlzdCBxdWVyeVxuICAgICAqL1xuICAgIHByaXZhdGUgY29sdW1ua2V5czogc3RyaW5nW107XG4gICAgLyoqXG4gICAgICogQ29udGFpbmVyIG9mIENvbHVtbiBJbnN0YW5jZXNcbiAgICAgKi9cbiAgICBwcml2YXRlIGNvbHVtbnM6IENvbHVtbltdO1xuICAgIC8qKlxuICAgICAqIFJlY29yZCBJbmRleCB3ZSBjdXJyZW50bHkgcG9pbnQgdG8gaW4gcmVjb3JkIGxpc3RcbiAgICAgKi9cbiAgICBwcml2YXRlIHJlY29yZEluZGV4OiBudW1iZXI7XG4gICAgLyoqXG4gICAgICogUmVjb3JkIExpc3QgKExpc3Qgb2Ygcm93cylcbiAgICAgKi9cbiAgICBwcml2YXRlIHJlY29yZHM6IFJlY29yZFtdO1xuXG4gICAgLyoqXG4gICAgICogQ29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0gcmF3IEFQSSBwbGFpbiByZXNwb25zZVxuICAgICAqIEBwYXJhbSBjbWQgQVBJIGNvbW1hbmQgdXNlZCB3aXRoaW4gdGhpcyByZXF1ZXN0XG4gICAgICogQHBhcmFtICRwaCBwbGFjZWhvbGRlciBhcnJheSB0byBnZXQgdmFycyBpbiByZXNwb25zZSBkZXNjcmlwdGlvbiBkeW5hbWljYWxseSByZXBsYWNlZFxuICAgICAqL1xuICAgIHB1YmxpYyBjb25zdHJ1Y3RvcihyYXc6IHN0cmluZywgY21kOiBhbnksIHBoOiBhbnkgPSB7fSkge1xuXG4gICAgICAgIHN1cGVyKHJhdyk7XG5cbiAgICAgICAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKHBoKTtcbiAgICAgICAga2V5cy5mb3JFYWNoKCh2YXJOYW1lOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIHRoaXMucmF3ID0gdGhpcy5yYXcucmVwbGFjZShuZXcgUmVnRXhwKGB7JHt2YXJOYW1lfX1gLCBcImdcIiksIHBoW3Zhck5hbWVdKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMucmF3ID0gdGhpcy5yYXcucmVwbGFjZSgvXFx7W0EtWl9dK1xcfS9nLCBcIlwiKTtcbiAgICAgICAgLyogZXNsaW50LWRpc2FibGUgY29uc3RydWN0b3Itc3VwZXIgKi9cbiAgICAgICAgc3VwZXIodGhpcy5yYXcpO1xuICAgICAgICAvKiBlc2xpbnQtZW5hYmxlIGNvbnN0cnVjdG9yLXN1cGVyICovXG5cbiAgICAgICAgdGhpcy5jb21tYW5kID0gY21kO1xuICAgICAgICBpZiAoXG4gICAgICAgICAgICB0aGlzLmNvbW1hbmQgJiZcbiAgICAgICAgICAgIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLmNvbW1hbmQsIFwiUEFTU1dPUkRcIilcbiAgICAgICAgKSB7IC8vIG1ha2UgcGFzc3dvcmQgbm8gbG9uZ2VyIGFjY2Vzc2libGVcbiAgICAgICAgICAgIHRoaXMuY29tbWFuZC5QQVNTV09SRCA9IFwiKioqXCI7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jb2x1bW5rZXlzID0gW107XG4gICAgICAgIHRoaXMuY29sdW1ucyA9IFtdO1xuICAgICAgICB0aGlzLnJlY29yZEluZGV4ID0gMDtcbiAgICAgICAgdGhpcy5yZWNvcmRzID0gW107XG5cbiAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLmhhc2gsIFwiUFJPUEVSVFlcIikpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbEtleXMgPSBPYmplY3Qua2V5cyh0aGlzLmhhc2guUFJPUEVSVFkpO1xuICAgICAgICAgICAgbGV0IGNvdW50ID0gMDtcbiAgICAgICAgICAgIGNvbEtleXMuZm9yRWFjaCgoYzogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgZCA9IHRoaXMuaGFzaC5QUk9QRVJUWVtjXTtcbiAgICAgICAgICAgICAgICB0aGlzLmFkZENvbHVtbihjLCBkKTtcbiAgICAgICAgICAgICAgICBpZiAoZC5sZW5ndGggPiBjb3VudCkge1xuICAgICAgICAgICAgICAgICAgICBjb3VudCA9IGQubGVuZ3RoO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZDogYW55ID0ge307XG4gICAgICAgICAgICAgICAgY29sS2V5cy5mb3JFYWNoKChrOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29sID0gdGhpcy5nZXRDb2x1bW4oayk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb2wpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHYgPSBjb2wuZ2V0RGF0YUJ5SW5kZXgoaSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodiAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRba10gPSB2O1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdGhpcy5hZGRSZWNvcmQoZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGQgYSBjb2x1bW4gdG8gdGhlIGNvbHVtbiBsaXN0XG4gICAgICogQHBhcmFtIGtleSBjb2x1bW4gbmFtZVxuICAgICAqIEBwYXJhbSBkYXRhIGFycmF5IG9mIGNvbHVtbiBkYXRhXG4gICAgICogQHJldHVybnMgQ3VycmVudCBSZXNwb25zZSBJbnN0YW5jZSBmb3IgbWV0aG9kIGNoYWluaW5nXG4gICAgICovXG4gICAgcHVibGljIGFkZENvbHVtbihrZXk6IHN0cmluZywgZGF0YTogc3RyaW5nW10pOiBSZXNwb25zZSB7XG4gICAgICAgIGNvbnN0IGNvbCA9IG5ldyBDb2x1bW4oa2V5LCBkYXRhKTtcbiAgICAgICAgdGhpcy5jb2x1bW5zLnB1c2goY29sKTtcbiAgICAgICAgdGhpcy5jb2x1bW5rZXlzLnB1c2goa2V5KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkIGEgcmVjb3JkIHRvIHRoZSByZWNvcmQgbGlzdFxuICAgICAqIEBwYXJhbSBoIHJvdyBoYXNoIGRhdGFcbiAgICAgKiBAcmV0dXJucyBDdXJyZW50IFJlc3BvbnNlIEluc3RhbmNlIGZvciBtZXRob2QgY2hhaW5pbmdcbiAgICAgKi9cbiAgICBwdWJsaWMgYWRkUmVjb3JkKGg6IGFueSk6IFJlc3BvbnNlIHtcbiAgICAgICAgdGhpcy5yZWNvcmRzLnB1c2gobmV3IFJlY29yZChoKSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBjb2x1bW4gYnkgY29sdW1uIG5hbWVcbiAgICAgKiBAcGFyYW0ga2V5IGNvbHVtbiBuYW1lXG4gICAgICogQHJldHVybnMgY29sdW1uIGluc3RhbmNlIG9yIG51bGwgaWYgY29sdW1uIGRvZXMgbm90IGV4aXN0XG4gICAgICovXG4gICAgcHVibGljIGdldENvbHVtbihrZXk6IHN0cmluZyk6IENvbHVtbiB8IG51bGwge1xuICAgICAgICByZXR1cm4gKHRoaXMuaGFzQ29sdW1uKGtleSkgPyB0aGlzLmNvbHVtbnNbdGhpcy5jb2x1bW5rZXlzLmluZGV4T2Yoa2V5KV0gOiBudWxsKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgRGF0YSBieSBDb2x1bW4gTmFtZSBhbmQgSW5kZXhcbiAgICAgKiBAcGFyYW0gY29sa2V5IGNvbHVtbiBuYW1lXG4gICAgICogQHBhcmFtIGluZGV4IGNvbHVtbiBkYXRhIGluZGV4XG4gICAgICogQHJldHVybnMgY29sdW1uIGRhdGEgYXQgaW5kZXggb3IgbnVsbCBpZiBub3QgZm91bmRcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0Q29sdW1uSW5kZXgoY29sa2V5OiBzdHJpbmcsIGluZGV4OiBudW1iZXIpOiBzdHJpbmcgfCBudWxsIHtcbiAgICAgICAgY29uc3QgY29sID0gdGhpcy5nZXRDb2x1bW4oY29sa2V5KTtcbiAgICAgICAgcmV0dXJuIGNvbCA/IGNvbC5nZXREYXRhQnlJbmRleChpbmRleCkgOiBudWxsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBDb2x1bW4gTmFtZXNcbiAgICAgKiBAcmV0dXJucyBBcnJheSBvZiBDb2x1bW4gTmFtZXNcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0Q29sdW1uS2V5cygpOiBzdHJpbmdbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbHVtbmtleXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IExpc3Qgb2YgQ29sdW1uc1xuICAgICAqIEByZXR1cm5zIEFycmF5IG9mIENvbHVtbnNcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0Q29sdW1ucygpOiBDb2x1bW5bXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbHVtbnM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IENvbW1hbmQgdXNlZCBpbiB0aGlzIHJlcXVlc3RcbiAgICAgKiBAcmV0dXJucyBjb21tYW5kXG4gICAgICovXG4gICAgcHVibGljIGdldENvbW1hbmQoKTogYW55IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29tbWFuZDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgQ29tbWFuZCB1c2VkIGluIHRoaXMgcmVxdWVzdCBpbiBwbGFpbiB0ZXh0IGZvcm1hdFxuICAgICAqIEByZXR1cm4gY29tbWFuZCBhcyBwbGFpbiB0ZXh0XG4gICAgICovXG4gICAgcHVibGljIGdldENvbW1hbmRQbGFpbigpOiBzdHJpbmcge1xuICAgICAgICBsZXQgdG1wID0gXCJcIjtcbiAgICAgICAgT2JqZWN0LmtleXModGhpcy5jb21tYW5kKS5mb3JFYWNoKChrZXk6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgdG1wICs9IGAke2tleX0gPSAke3RoaXMuY29tbWFuZFtrZXldfVxcbmA7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gdG1wO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBQYWdlIE51bWJlciBvZiBjdXJyZW50IExpc3QgUXVlcnlcbiAgICAgKiBAcmV0dXJucyBwYWdlIG51bWJlciBvciBudWxsIGluIGNhc2Ugb2YgYSBub24tbGlzdCByZXNwb25zZVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRDdXJyZW50UGFnZU51bWJlcigpOiBudW1iZXIgfCBudWxsIHtcbiAgICAgICAgY29uc3QgZmlyc3QgPSB0aGlzLmdldEZpcnN0UmVjb3JkSW5kZXgoKTtcbiAgICAgICAgY29uc3QgbGltaXQgPSB0aGlzLmdldFJlY29yZHNMaW1pdGF0aW9uKCk7XG4gICAgICAgIGlmIChmaXJzdCAhPT0gbnVsbCAmJiBsaW1pdCkge1xuICAgICAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IoZmlyc3QgLyBsaW1pdCkgKyAxO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBSZWNvcmQgb2YgY3VycmVudCByZWNvcmQgaW5kZXhcbiAgICAgKiBAcmV0dXJucyBSZWNvcmQgb3IgbnVsbCBpbiBjYXNlIG9mIGEgbm9uLWxpc3QgcmVzcG9uc2VcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0Q3VycmVudFJlY29yZCgpOiBSZWNvcmQgfCBudWxsIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGFzQ3VycmVudFJlY29yZCgpID8gdGhpcy5yZWNvcmRzW3RoaXMucmVjb3JkSW5kZXhdIDogbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgSW5kZXggb2YgZmlyc3Qgcm93IGluIHRoaXMgcmVzcG9uc2VcbiAgICAgKiBAcmV0dXJucyBmaXJzdCByb3cgaW5kZXhcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0Rmlyc3RSZWNvcmRJbmRleCgpOiBudW1iZXIgfCBudWxsIHtcbiAgICAgICAgY29uc3QgY29sID0gdGhpcy5nZXRDb2x1bW4oXCJGSVJTVFwiKTtcbiAgICAgICAgaWYgKGNvbCkge1xuICAgICAgICAgICAgY29uc3QgZiA9IGNvbC5nZXREYXRhQnlJbmRleCgwKTtcbiAgICAgICAgICAgIGlmIChmICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlSW50KGYsIDEwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5yZWNvcmRzLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IGxhc3QgcmVjb3JkIGluZGV4IG9mIHRoZSBjdXJyZW50IGxpc3QgcXVlcnlcbiAgICAgKiBAcmV0dXJucyByZWNvcmQgaW5kZXggb3IgbnVsbCBmb3IgYSBub24tbGlzdCByZXNwb25zZVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRMYXN0UmVjb3JkSW5kZXgoKTogbnVtYmVyIHwgbnVsbCB7XG4gICAgICAgIGNvbnN0IGNvbCA9IHRoaXMuZ2V0Q29sdW1uKFwiTEFTVFwiKTtcbiAgICAgICAgaWYgKGNvbCkge1xuICAgICAgICAgICAgY29uc3QgbCA9IGNvbC5nZXREYXRhQnlJbmRleCgwKTtcbiAgICAgICAgICAgIGlmIChsICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlSW50KGwsIDEwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjb25zdCBsZW4gPSB0aGlzLmdldFJlY29yZHNDb3VudCgpO1xuICAgICAgICBpZiAobGVuKSB7XG4gICAgICAgICAgICByZXR1cm4gKGxlbiAtIDEpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBSZXNwb25zZSBhcyBMaXN0IEhhc2ggaW5jbHVkaW5nIHVzZWZ1bCBtZXRhIGRhdGEgZm9yIHRhYmxlc1xuICAgICAqIEByZXR1cm5zIGhhc2ggaW5jbHVkaW5nIGxpc3QgbWV0YSBkYXRhIGFuZCBhcnJheSBvZiByb3dzIGluIGhhc2ggbm90YXRpb25cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0TGlzdEhhc2goKTogYW55IHtcbiAgICAgICAgY29uc3QgbGg6IGFueVtdID0gW107XG4gICAgICAgIHRoaXMuZ2V0UmVjb3JkcygpLmZvckVhY2goKHJlYykgPT4ge1xuICAgICAgICAgICAgbGgucHVzaChyZWMuZ2V0RGF0YSgpKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBMSVNUOiBsaCxcbiAgICAgICAgICAgIG1ldGE6IHtcbiAgICAgICAgICAgICAgICBjb2x1bW5zOiB0aGlzLmdldENvbHVtbktleXMoKSxcbiAgICAgICAgICAgICAgICBwZzogdGhpcy5nZXRQYWdpbmF0aW9uKCksXG4gICAgICAgICAgICB9LFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBuZXh0IHJlY29yZCBpbiByZWNvcmQgbGlzdFxuICAgICAqIEByZXR1cm5zIFJlY29yZCBvciBudWxsIGluIGNhc2UgdGhlcmUncyBubyBmdXJ0aGVyIHJlY29yZFxuICAgICAqL1xuICAgIHB1YmxpYyBnZXROZXh0UmVjb3JkKCk6IFJlY29yZCB8IG51bGwge1xuICAgICAgICBpZiAodGhpcy5oYXNOZXh0UmVjb3JkKCkpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnJlY29yZHNbKyt0aGlzLnJlY29yZEluZGV4XTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgUGFnZSBOdW1iZXIgb2YgbmV4dCBsaXN0IHF1ZXJ5XG4gICAgICogQHJldHVybnMgcGFnZSBudW1iZXIgb3IgbnVsbCBpZiB0aGVyZSdzIG5vIG5leHQgcGFnZVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXROZXh0UGFnZU51bWJlcigpOiBudW1iZXIgfCBudWxsIHtcbiAgICAgICAgY29uc3QgY3AgPSB0aGlzLmdldEN1cnJlbnRQYWdlTnVtYmVyKCk7XG4gICAgICAgIGlmIChjcCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcGFnZSA9IGNwICsgMTtcbiAgICAgICAgY29uc3QgcGFnZXMgPSB0aGlzLmdldE51bWJlck9mUGFnZXMoKTtcbiAgICAgICAgcmV0dXJuIChwYWdlIDw9IHBhZ2VzID8gcGFnZSA6IHBhZ2VzKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIG51bWJlciBvZiBwYWdlcyBhdmFpbGFibGUgZm9yIHRoaXMgbGlzdCBxdWVyeVxuICAgICAqIEByZXR1cm5zIG51bWJlciBvZiBwYWdlc1xuICAgICAqL1xuICAgIHB1YmxpYyBnZXROdW1iZXJPZlBhZ2VzKCk6IG51bWJlciB7XG4gICAgICAgIGNvbnN0IHQgPSB0aGlzLmdldFJlY29yZHNUb3RhbENvdW50KCk7XG4gICAgICAgIGNvbnN0IGxpbWl0ID0gdGhpcy5nZXRSZWNvcmRzTGltaXRhdGlvbigpO1xuICAgICAgICBpZiAodCAmJiBsaW1pdCkge1xuICAgICAgICAgICAgcmV0dXJuIE1hdGguY2VpbCh0IC8gdGhpcy5nZXRSZWNvcmRzTGltaXRhdGlvbigpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gMDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgb2JqZWN0IGNvbnRhaW5pbmcgYWxsIHBhZ2luZyBkYXRhXG4gICAgICogQHJldHVybnMgcGFnaW5hdG9yIGRhdGFcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0UGFnaW5hdGlvbigpOiBhbnkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgQ09VTlQ6IHRoaXMuZ2V0UmVjb3Jkc0NvdW50KCksXG4gICAgICAgICAgICBDVVJSRU5UUEFHRTogdGhpcy5nZXRDdXJyZW50UGFnZU51bWJlcigpLFxuICAgICAgICAgICAgRklSU1Q6IHRoaXMuZ2V0Rmlyc3RSZWNvcmRJbmRleCgpLFxuICAgICAgICAgICAgTEFTVDogdGhpcy5nZXRMYXN0UmVjb3JkSW5kZXgoKSxcbiAgICAgICAgICAgIExJTUlUOiB0aGlzLmdldFJlY29yZHNMaW1pdGF0aW9uKCksXG4gICAgICAgICAgICBORVhUUEFHRTogdGhpcy5nZXROZXh0UGFnZU51bWJlcigpLFxuICAgICAgICAgICAgUEFHRVM6IHRoaXMuZ2V0TnVtYmVyT2ZQYWdlcygpLFxuICAgICAgICAgICAgUFJFVklPVVNQQUdFOiB0aGlzLmdldFByZXZpb3VzUGFnZU51bWJlcigpLFxuICAgICAgICAgICAgVE9UQUw6IHRoaXMuZ2V0UmVjb3Jkc1RvdGFsQ291bnQoKSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgUGFnZSBOdW1iZXIgb2YgcHJldmlvdXMgbGlzdCBxdWVyeVxuICAgICAqIEByZXR1cm5zIHBhZ2UgbnVtYmVyIG9yIG51bGwgaWYgdGhlcmUncyBubyBwcmV2aW91cyBwYWdlXG4gICAgICovXG4gICAgcHVibGljIGdldFByZXZpb3VzUGFnZU51bWJlcigpOiBudW1iZXIgfCBudWxsIHtcbiAgICAgICAgY29uc3QgY3AgPSB0aGlzLmdldEN1cnJlbnRQYWdlTnVtYmVyKCk7XG4gICAgICAgIGlmIChjcCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIChjcCAtIDEpIHx8IG51bGw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHByZXZpb3VzIHJlY29yZCBpbiByZWNvcmQgbGlzdFxuICAgICAqIEByZXR1cm5zIFJlY29yZCBvciBudWxsIGlmIHRoZXJlJ3Mgbm8gcHJldmlvdXMgcmVjb3JkXG4gICAgICovXG4gICAgcHVibGljIGdldFByZXZpb3VzUmVjb3JkKCk6IFJlY29yZCB8IG51bGwge1xuICAgICAgICBpZiAodGhpcy5oYXNQcmV2aW91c1JlY29yZCgpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5yZWNvcmRzWy0tdGhpcy5yZWNvcmRJbmRleF07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IFJlY29yZCBhdCBnaXZlbiBpbmRleFxuICAgICAqIEBwYXJhbSBpZHggcmVjb3JkIGluZGV4XG4gICAgICogQHJldHVybnMgUmVjb3JkIG9yIG51bGwgaWYgaW5kZXggZG9lcyBub3QgZXhpc3RcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0UmVjb3JkKGlkeDogbnVtYmVyKTogUmVjb3JkIHwgbnVsbCB7XG4gICAgICAgIGlmIChpZHggPj0gMCAmJiB0aGlzLnJlY29yZHMubGVuZ3RoID4gaWR4KSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5yZWNvcmRzW2lkeF07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IGFsbCBSZWNvcmRzXG4gICAgICogQHJldHVybnMgYXJyYXkgb2YgcmVjb3Jkc1xuICAgICAqL1xuICAgIHB1YmxpYyBnZXRSZWNvcmRzKCk6IFJlY29yZFtdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVjb3JkcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgY291bnQgb2Ygcm93cyBpbiB0aGlzIHJlc3BvbnNlXG4gICAgICogQHJldHVybnMgY291bnQgb2Ygcm93c1xuICAgICAqL1xuICAgIHB1YmxpYyBnZXRSZWNvcmRzQ291bnQoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVjb3Jkcy5sZW5ndGg7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRvdGFsIGNvdW50IG9mIHJlY29yZHMgYXZhaWxhYmxlIGZvciB0aGUgbGlzdCBxdWVyeVxuICAgICAqIEByZXR1cm5zIHRvdGFsIGNvdW50IG9mIHJlY29yZHMgb3IgY291bnQgb2YgcmVjb3JkcyBmb3IgYSBub24tbGlzdCByZXNwb25zZVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRSZWNvcmRzVG90YWxDb3VudCgpOiBudW1iZXIge1xuICAgICAgICBjb25zdCBjb2wgPSB0aGlzLmdldENvbHVtbihcIlRPVEFMXCIpO1xuICAgICAgICBpZiAoY29sKSB7XG4gICAgICAgICAgICBjb25zdCB0ID0gY29sLmdldERhdGFCeUluZGV4KDApO1xuICAgICAgICAgICAgaWYgKHQgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcGFyc2VJbnQodCwgMTApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmdldFJlY29yZHNDb3VudCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBsaW1pdChhdGlvbikgc2V0dGluZyBvZiB0aGUgY3VycmVudCBsaXN0IHF1ZXJ5XG4gICAgICogVGhpcyBpcyB0aGUgY291bnQgb2YgcmVxdWVzdGVkIHJvd3NcbiAgICAgKiBAcmV0dXJucyBsaW1pdCBzZXR0aW5nIG9yIGNvdW50IHJlcXVlc3RlZCByb3dzXG4gICAgICovXG4gICAgcHVibGljIGdldFJlY29yZHNMaW1pdGF0aW9uKCk6IG51bWJlciB7XG4gICAgICAgIGNvbnN0IGNvbCA9IHRoaXMuZ2V0Q29sdW1uKFwiTElNSVRcIik7XG4gICAgICAgIGlmIChjb2wpIHtcbiAgICAgICAgICAgIGNvbnN0IGwgPSBjb2wuZ2V0RGF0YUJ5SW5kZXgoMCk7XG4gICAgICAgICAgICBpZiAobCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZUludChsLCAxMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0UmVjb3Jkc0NvdW50KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgdGhpcyBsaXN0IHF1ZXJ5IGhhcyBhIG5leHQgcGFnZVxuICAgICAqIEByZXR1cm5zIGJvb2xlYW4gcmVzdWx0XG4gICAgICovXG4gICAgcHVibGljIGhhc05leHRQYWdlKCk6IGJvb2xlYW4ge1xuICAgICAgICBjb25zdCBjcCA9IHRoaXMuZ2V0Q3VycmVudFBhZ2VOdW1iZXIoKTtcbiAgICAgICAgaWYgKGNwID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIChjcCArIDEgPD0gdGhpcy5nZXROdW1iZXJPZlBhZ2VzKCkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIHRoaXMgbGlzdCBxdWVyeSBoYXMgYSBwcmV2aW91cyBwYWdlXG4gICAgICogQHJldHVybnMgYm9vbGVhbiByZXN1bHRcbiAgICAgKi9cbiAgICBwdWJsaWMgaGFzUHJldmlvdXNQYWdlKCk6IGJvb2xlYW4ge1xuICAgICAgICBjb25zdCBjcCA9IHRoaXMuZ2V0Q3VycmVudFBhZ2VOdW1iZXIoKTtcbiAgICAgICAgaWYgKGNwID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICgoY3AgLSAxKSA+IDApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlc2V0IGluZGV4IGluIHJlY29yZCBsaXN0IGJhY2sgdG8gemVyb1xuICAgICAqIEByZXR1cm5zIEN1cnJlbnQgUmVzcG9uc2UgSW5zdGFuY2UgZm9yIG1ldGhvZCBjaGFpbmluZ1xuICAgICAqL1xuICAgIHB1YmxpYyByZXdpbmRSZWNvcmRMaXN0KCk6IFJlc3BvbnNlIHtcbiAgICAgICAgdGhpcy5yZWNvcmRJbmRleCA9IDA7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIGNvbHVtbiBleGlzdHMgaW4gcmVzcG9uc2VcbiAgICAgKiBAcGFyYW0ga2V5IGNvbHVtbiBuYW1lXG4gICAgICogQHJldHVybnMgYm9vbGVhbiByZXN1bHRcbiAgICAgKi9cbiAgICBwcml2YXRlIGhhc0NvbHVtbihrZXk6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gKHRoaXMuY29sdW1ua2V5cy5pbmRleE9mKGtleSkgIT09IC0xKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiB0aGUgcmVjb3JkIGxpc3QgY29udGFpbnMgYSByZWNvcmQgZm9yIHRoZVxuICAgICAqIGN1cnJlbnQgcmVjb3JkIGluZGV4IGluIHVzZVxuICAgICAqIEByZXR1cm5zIGJvb2xlYW4gcmVzdWx0XG4gICAgICovXG4gICAgcHJpdmF0ZSBoYXNDdXJyZW50UmVjb3JkKCk6IGJvb2xlYW4ge1xuICAgICAgICBjb25zdCBsZW4gPSB0aGlzLnJlY29yZHMubGVuZ3RoO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgbGVuID4gMCAmJlxuICAgICAgICAgICAgdGhpcy5yZWNvcmRJbmRleCA+PSAwICYmXG4gICAgICAgICAgICB0aGlzLnJlY29yZEluZGV4IDwgbGVuXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgdGhlIHJlY29yZCBsaXN0IGNvbnRhaW5zIGEgbmV4dCByZWNvcmQgZm9yIHRoZVxuICAgICAqIGN1cnJlbnQgcmVjb3JkIGluZGV4IGluIHVzZVxuICAgICAqIEByZXR1cm5zIGJvb2xlYW4gcmVzdWx0XG4gICAgICovXG4gICAgcHJpdmF0ZSBoYXNOZXh0UmVjb3JkKCk6IGJvb2xlYW4ge1xuICAgICAgICBjb25zdCBuZXh0ID0gdGhpcy5yZWNvcmRJbmRleCArIDE7XG4gICAgICAgIHJldHVybiAodGhpcy5oYXNDdXJyZW50UmVjb3JkKCkgJiYgKG5leHQgPCB0aGlzLnJlY29yZHMubGVuZ3RoKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgdGhlIHJlY29yZCBsaXN0IGNvbnRhaW5zIGEgcHJldmlvdXMgcmVjb3JkIGZvciB0aGVcbiAgICAgKiBjdXJyZW50IHJlY29yZCBpbmRleCBpbiB1c2VcbiAgICAgKiBAcmV0dXJucyBib29sZWFuIHJlc3VsdFxuICAgICAqL1xuICAgIHByaXZhdGUgaGFzUHJldmlvdXNSZWNvcmQoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiAodGhpcy5yZWNvcmRJbmRleCA+IDAgJiYgdGhpcy5oYXNDdXJyZW50UmVjb3JkKCkpO1xuICAgIH1cbn1cbiJdfQ==