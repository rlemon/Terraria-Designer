var canvas = document.getElementById('canvas'),
    context = canvas.getContext('2d'),
    height = canvas.height = document.body.offsetHeight,
    width = canvas.width = document.body.offsetWidth;

var save = document.getElementById('export');
save.addEventListener('click', function() {
    window.open(canvas.toDataURL("image/png"));
}, false);

var grid = [],
    block_size = 16,
    baseline = height - (height / 4);

var TILES = {
	'dirt': { id:  0},
	'stone': { id:  1},
	'iron_ore': { id:  6},
	'copper_ore': { id:  7},
	'gold_ore': { id:  8},
	'silver_ore': { id:  9},
	'demonite_ore': { id:  22},
	'ebonstone_block': { id:  25},
	'wood': { id:  30},
	'meteorite': { id:  37},
	'stone_brick': { id:  38},
	'red_brick': { id:  39},
	'clay_block': { id:  40},
	'blue_brick': { id:  41},
	'green_brick': { id:  43},
	'pink_brick': { id:  44},
	'gold_brick': { id:  45},
	'silver_brick': { id:  46},
	'copper_brick': { id:  47},
	'sand_block': { id:  53},
	'obsidian': { id:  56},
	'ash_block': { id:  57},
	'hellstone': { id:  58},
	'mud_block': { id:  59},
	'stone_saphire': { id:  63},
	'stone_ruby': { id:  64},
	'stone_emerald': { id:  65},
	'stone_amber': { id:  66},
	'stone_amethyst': { id:  67},
	'stone_diamond': { id:  68},
	'obsidian_brick': { id:  75},
	'hellstone_brick': { id:  76},
	'cobalt_ore': { id:  107},
	'mythril_ore': { id:  108},
	'adamantite_ore': { id:  111},
	'ebonsand_block': { id:  112},
	'pearlsand_block': { id:  116},
	'pearlstone_block': { id:  117},
	'pearlstone_brick': { id:  118},
	'iridescent_brick': { id:  119},
	'mudstone_block': { id:  120},
	'cobalt_brick': { id:  121},
	'mythril_brick': { id:  122},
	'silt_block': { id:  123},
	'active_stone_block': { id:  130},
	'inactive_stone_block': { id:  131},
	'demonite_brick': { id:  140},
	'candy_cane_block': { id:  145},
	'green_candy_cane_block': { id:  146},
	'snow_block': { id:  147},
	'snow_brick': { id:  148},
	'adamantite_beam': { id:  150},
	'sandstone_brick': { id:  151},
	'ebonstone_brick': { id:  152},
	'red_stucco': { id:  153},
	'yellow_stucco': { id:  154},
	'green_stucco': { id:  155},
	'gray_stucco': { id:  156},
	'ebonwood': { id:  157},
	'rich_mahogany': { id:  158},
	'pearlwood': { id:  159},
	'ice_block': { id:  161},
	'purple_ice_block': { id:  163},
	'pink_ice_block': { id:  164},
	'tin_ore': { id:  166},
	'lead_ore': { id:  167},
	'tungsten_ore': { id:  168},
	'platinum_ore': { id:  169},
	'tin_brick': { id:  175},
	'tungsten_brick': { id:  176},
	'platinum_brick': { id:  177},
	'cactus': { id:  188},
	'glowing_mushroom': { id:  190},
	'slime_block': { id:  193},
	'flesh_block': { id:  195},
	'rain_cloud': { id:  196}
};

var TILEDATA = {
    height: 270,
    width: 288,
    image: new Image()
};

var len = Object.keys(TILES).length,
	optiondf = document.createDocumentFragment();

var type = document.getElementById('type');

for( var tile in TILES ) {
	if( TILES.hasOwnProperty(tile) ) {
	
		var option = document.createElement('option');
		option.textContent = tile.replace(/_/g, ' ');
		option.value = tile;
		optiondf.appendChild(option);
	
		TILES[tile].image = new Image();
		TILES[tile].image.src = 'tiledata/Tiles_' + TILES[tile].id + '.png';
		TILES[tile].image.onload = function() {
			if( --len === 0 ) {
				TILEDATA.image = TILES.dirt.image;
				type.appendChild(optiondf);
				init();
			}
		};
	}
}

function init() {
	type.addEventListener('change', function() {
		TILEDATA.image = TILES[type.options[type.selectedIndex].value].image;
	}, false);
		
    // populate grid
    // I'm sure there is a more clever way to do this. 
    for (var y = 0; y < height / block_size; y++) {
        grid[y] = [];
        for (var x = 0; x < width / block_size; x++) {
            grid[y][x] = {
                tiledata: [],
				tile: TILEDATA.image,
                empty: y * block_size < baseline
            };
        }
    }
    // so this is a pretty piss poor way about it if you ask me, but w/e
    // populate tiledata. we do this after all grid values have been set 
    // so we can balance the blocks.
    for (var y = 0; y < height / block_size; y++) {
        for (var x = 0; x < width / block_size; x++) {
            grid[y][x].tiledata = findTile(x, y);
        }
    }
    // register mouse events
    canvas.addEventListener('click', request_place, false);
    canvas.addEventListener('mousedown', function () {
        canvas.addEventListener('mousemove', request_place, false);
    }, false);
    canvas.addEventListener('mouseup', function () {
        canvas.removeEventListener('mousemove', request_place, false);
    }, false);

    // paint :D
    paint();
}
// returns false if cell is empty, true on all frame edges
function tilecheck(x, y) {
    return {
        top: y > 0 ? !grid[y - 1][x].empty : true,
        left: x > 0 ? !grid[y][x - 1].empty : true,
        right: x < grid[y].length - 1 ? !grid[y][x + 1].empty : true,
        bottom: y < grid.length - 1 ? !grid[y + 1][x].empty : true
    };

}

function isPlaceable(x, y) {
    if (!grid[y][x].empty) {
        return false;
    }
    if( x > 0 ) {
        if(!grid[y][x-1].empty) return true;
    }
    if( y > 0 ) {
        if(!grid[y-1][x].empty) return true;
    }
    if( x < grid[y].length - 1 ) {
        if(!grid[y][x+1].empty) return true;
    }
    if( y < grid.length - 1 ) {
        if(!grid[y+1][x].empty) return true;
    }
    return false;
}

function random(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function findTile(x, y) {

    var ad = tilecheck(x,y),
        top = ad.top,
        right = ad.right,
        left = ad.left,
        bottom = ad.bottom;

    /* single tile */
    if (!left && !right && !top && !bottom) {
        return random(TILEMAP.single);
    }

    /* thin lines vertical */
    if (!left && !right && top && bottom) {
        return random(TILEMAP.thin.vertical.center);
    }
    if (!left && !right && !top && bottom) {
        return random(TILEMAP.thin.vertical.top);
    }
    if (!left && !right && top && !bottom) {
        return random(TILEMAP.thin.vertical.bottom);
    }

    /* thin lines horizontal */
    if (left && right && !top && !bottom) {
        return random(TILEMAP.thin.horizontal.center);
    }
    if (left && !right && !top && !bottom) {
        return random(TILEMAP.thin.horizontal.right);
    }
    if (!left && right && !top && !bottom) {
        return random(TILEMAP.thin.horizontal.left);
    }

    /* center blocks */
    if (left && right && top && bottom) {
        return random(TILEMAP.center);
    }

    /* left side */
    if (!left && right && top && bottom) {
        return random(TILEMAP.edges.left);
    }
    /* right side */
    if (left && !right && top && bottom) {
        return random(TILEMAP.edges.right);
    }
    /* top side */
    if (left && right && !top && bottom) {
        return random(TILEMAP.edges.top);
    }
    /* bottom side */
    if (left && right && top && !bottom) {
        return random(TILEMAP.edges.bottom);
    }

    /* top left side */
    if (!left && right && !top && bottom) {
        return random(TILEMAP.edges.topLeft);
    }
    /* top right side */
    if (left && !right && !top && bottom) {
        return random(TILEMAP.edges.topRight);
    }
    /* bottom left side */
    if (!left && right && top && !bottom) {
        return random(TILEMAP.edges.bottomLeft);
    }
    /* bottom right side */
    if (left && !right && top && !bottom) {
        return random(TILEMAP.edges.bottomRight);
    }
    return [];
}

function update_adjacent(x, y) {
    if (y > 0 && !grid[y - 1][x].empty) {
        grid[y - 1][x].tiledata = findTile(x, y - 1);
    }
    if (y < grid.length - 1 && !grid[y + 1][x].empty) {
        grid[y + 1][x].tiledata = findTile(x, y + 1);
    }

    if (x > 0 && !grid[y][x - 1].empty) {
        grid[y][x - 1].tiledata = findTile(x - 1, y);
    }
    if (x < grid[y].length - 1 && !grid[y][x + 1].empty) {
        grid[y][x + 1].tiledata = findTile(x + 1, y);
    }
    paint();
}

function request_place(event) {
    var clickX = event.clientX - event.target.offsetLeft,
        clickY = event.clientY - event.target.offsetTop,
        x = Math.floor(clickX / block_size),
        y = Math.floor(clickY / block_size);

    if( y < 0 ) { 
        y = 0;
    }
    if( y > grid.length - 1 ) {
        y = grid.length - 1;
    }
    if( x < 0 ) {
        x = 0;
    }
    if( x > grid[y].length - 1 ) {
        x = grid[y].length - 1;
    }
    // if ctrl key is pressed kill the block
    // once moved to sprites show a little blow up animation?
    if (event.ctrlKey) {
        if (grid[y][x].empty) {
            return;
        }
        grid[y][x].empty = true;
        update_adjacent(x, y);
        // if the cell is placeable then we place it
    } else if (isPlaceable(x, y)) {
        grid[y][x].tiledata = findTile(x, y);
		grid[y][x].tile = TILEDATA.image;
        grid[y][x].empty = false;
        update_adjacent(x, y);
    }
    paint();
}

function paint() {
    for (var y = 0; y < grid.length; y++) {
        for (var x = 0; x < grid[y].length; x++) {
            if (grid[y][x].empty) {
				context.clearRect(x * block_size, y * block_size, block_size, block_size);
				continue;
            }
            var pos = grid[y][x].tiledata;
            context.drawImage(
            grid[y][x].tile,
            pos[1] * block_size + pos[1] * 2,
            pos[0] * block_size + pos[0] * 2,
            block_size,
            block_size,
            x * block_size,
            y * block_size,
            block_size,
            block_size);
        }
    }
}