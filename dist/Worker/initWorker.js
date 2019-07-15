importScripts('ImprovedNoise.js');
// importScripts('https://cdnjs.cloudflare.com/ajax/libs/three.js/99/three.min.js');

self.onmessage = function (e) {

    if (e.data !== undefined) {

        var perlin = new ImprovedNoise();

        var ps;

        var pos = [];
        var col = [];
        var noises = [];
        var move = [];
        var phase = [];

        var angles = [];

        var noise_val = [];

        var micronoise_val = [];

        var fades = [];

        var nx = 0;
        var mnx = 0;

        var w = e.data.pn;
        var h = e.data.pn;

        for (var x = 0; x < w; x++) {

            var ny = 0;
            var mny = 0;

            var a = (x / w) * (Math.PI);

            for (var y = 0; y < h; y++) {

                var m = 0.0;

                var b = (y / h) * (Math.PI * 1);

                nx = Math.sin(a);
                ny = Math.sin(b);

                angles.push(Math.cos(b) * Math.cos(a));
                angles.push(Math.sin(b) * Math.cos(a));
                angles.push(Math.sin(a));

                var _x = (x * 2) - (w * 1);
                var _y = 0;
                var _z = (y * 2) - (h * 1);

                move.push(m);

                if (e.data.mobile) {
                    pos.push(_x * e.data.m);
                    pos.push(_y);
                    pos.push(_z * (e.data.m * 0.75));
                } else {
                    pos.push(_x * (e.data.m * 1));
                    pos.push(_y);
                    pos.push(_z * e.data.m);
                }

                col.push(1.0);
                col.push(1.0);
                col.push(1.0);
                col.push(1.0);

                noises.push(Math.random() * 0.000025);
                fades.push(Math.random() * 0.1);

                noise_val.push(nx);
                noise_val.push(ny);

                micronoise_val.push(mnx);
                micronoise_val.push(mny);

                phase.push(100000.0 + (Math.random() * (Math.PI * 2.0)));

                if (Math.random() > 0.95) {
                    m = 1.0;
                    _y += Math.random() * 1000.0;

                    move.push(m);

                    fades.push(Math.random() * 0.1);

                    if (e.data.mobile) {
                        pos.push(_x * e.data.m);
                        pos.push(_y);
                        pos.push(_z * (e.data.m * 0.25));
                    } else {
                        pos.push(_x * (e.data.m * 1));
                        pos.push(_y);
                        pos.push(_z * e.data.m);
                    }

                    angles.push(Math.cos(b) * Math.cos(a));
                    angles.push(Math.sin(b) * Math.cos(a));
                    angles.push(Math.sin(a));

                    col.push(1.0);
                    col.push(1.0);
                    col.push(1.0);
                    col.push(1.0);

                    noises.push(Math.random() * 0.000025);

                    noise_val.push(nx);
                    noise_val.push(ny);

                    micronoise_val.push(mnx);
                    micronoise_val.push(mny);

                    phase.push(100000.0 + (Math.random() * (Math.PI * 2.0)));

                }

                ny += 0.01;
                mny += 0.1;

            }

            nx += 0.01;
            mnx += 0.1;

        }

        var result = {
            p: pos,
            n: noises,
            c: col,
            m: move,
            i: phase,
            nx: noise_val,
            mnx: micronoise_val,
            a: angles,
            f: fades,
        };

        this.postMessage(result);
    }

}

// self.onmessage = function(e) {
//     // console.log("E " + e.data);

//     // Do all the work here the postMessage the result
//     var result = 10 + e.data;
//     console.log("result: " + result);
//     self.postMessage(result)
//   }
