//@target indesign
//@include "require.js"

(function main() {
    if (app.documents.length < 1) return;
    var doc = app.activeDocument;

    if (app.selection.length < 1) return;
    var sel = app.selection;

    if (!app.activeWindow) return;
    var window = app.activeWindow;
    var page = window.activePage;

    var selBounds = sel.reduce(function (collectionBounds, item) {
        item.visibleBounds.forEach(function (bound, idx) {
            var collectionBound = collectionBounds[idx];
            switch (idx) {
                case 0:
                case 1:
                    var min = Math.min(bound, collectionBound);
                    collectionBounds[idx] = min;
                    break;
                case 2:
                case 3:
                    var max = Math.max(bound, collectionBound);
                    collectionBounds[idx] = max;
                    break;
            }
        });
        return collectionBounds;
    }, sel[0].visibleBounds);

    var distance = UnitValue("0 mm");
    var distValue = distance.as("mm");

    var rec = page.rectangles.add({
        geometricBounds: [
            selBounds[0] - distValue,
            selBounds[1] - distValue,
            selBounds[2] + distValue,
            selBounds[3] + distValue
        ]
    });

    var topLeft = rec.resolve(AnchorPoint.TOP_LEFT_ANCHOR, CoordinateSpaces.SPREAD_COORDINATES)[0];
    var bottomRight = rec.resolve(
        AnchorPoint.BOTTOM_RIGHT_ANCHOR,
        CoordinateSpaces.SPREAD_COORDINATES
    )[0];
    var corners = [topLeft, bottomRight];

    rec.remove();

    page.reframe(CoordinateSpaces.SPREAD_COORDINATES, corners);

    window.zoom(ZoomOptions.FIT_PAGE);
})();
