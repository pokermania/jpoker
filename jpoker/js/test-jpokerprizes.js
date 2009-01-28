//
//     Copyright (C) 2009 Loic Dachary <loic@dachary.org>
//
//     This program is free software: you can redistribute it and/or modify
//     it under the terms of the GNU General Public License as published by
//     the Free Software Foundation, either version 3 of the License, or
//     (at your option) any later version.
//
//     This program is distributed in the hope that it will be useful,
//     but WITHOUT ANY WARRANTY; without even the implied warranty of
//     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//     GNU General Public License for more details.
//
//     You should have received a copy of the GNU General Public License
//     along with this program.  If not, see <http://www.gnu.org/licenses/>.
//

module("jpokerprizes");

var cleanup = function() {
    $("#main").empty();
    $('#jpokerAdminEditPrizes').dialog('close').remove();
};

var start_and_cleanup = function(id) {
    setTimeout(function() {
            cleanup(id);
            start();
        }, 1);
};

test("jpoker.tourneyAdminEditPrizes.getPrizes", function(){
        expect(1);
	var prizes = [{"serial": 1, "image_url": "url1"}, {"serial": 2, "image_url": "url2"}];

        var tourneyAdminEditPrizes = $.jpoker.plugins.tourneyAdminEditPrizes;
        var ajax = function(args) {
            args.success(prizes, 'success');
            equals(tourneyAdminEditPrizes.serial2prize[1].serial, 1);
        };
        tourneyAdminEditPrizes.getPrizes('URL', { ajax: ajax });
    });
