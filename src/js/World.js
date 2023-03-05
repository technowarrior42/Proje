import * as THREE from "three";

// World verileri
const worldScale = 32;

function lerp(a, b, p)
{
    // Lerp
    return (b - a) * p + a
}

function randomGradient(x, z)
{
    // Rastgele derece hesapla
    const randomDeg = Math.random() * 2 * Math.PI;

    // Koordinata göre hesapla
    return new THREE.Vector2(x + Math.sin(randomDeg), z + Math.cos(randomDeg));
}

function dotProduct(ix, iz, x, z)
{
    // Rastgele gradyan hesapla
    const gradient = randomGradient(x, z);

    // Mesafeyi hesapla
    const dx = x - ix;
    const dy = z - iz;

    // Dot product hesapla
    return (dx * gradient.x + dy * gradient.y);
}

export class World
{
    constructor(scene, gui, cx, cz)
    {
        this.scene = scene;
        this.gui = gui;

        // Chunk kooridantını gir
        this.cx = cx;
        this.cz = cz;

        // Chunk mesh'ini oluştur
        this.#setWorldMesh();
    }

    #setWorldHeight()
    {
        // Gridler
        const grid = [];

        // Dünya yüksekliklerini çiz
        for (let x = 0; x < worldScale; x++)
        {
            for (let z = 0; z < worldScale; z++)
            {
                const rx = (x / worldScale);
                const rz = (z / worldScale);

                // Perlin gürültüsünü hesapla
                var x1 = Math.floor(rx);
                var x2 = x1 + 1;
                var z1 = Math.floor(rz);
                var z2 = z1 + 1;

                var dx = rx - x1;
                var dz = rz - z1;

                var n0, n1, ix0, ix1;

                n0 = dotProduct(x1, z1, rx, rz);
                n1 = dotProduct(x2, z1, rx, rz);
                ix0 = lerp(n0, n1, dx);

                n0 = dotProduct(x1, z2, rx, rz);
                n1 = dotProduct(x2, z2, rx, rz);
                ix1 = lerp(n0, n1, dx);

                // Index'leri bul
                const index = (x * worldScale) + z;

                // Grid basşına değeri gir
                grid[index] = lerp(ix0, ix1, dz);
            }
        }

        return grid;
    }

    #getIndexFromCoord(x, z)
    {
        // Koordinata göre index'i bul
        return (x * worldScale) + z;
    }

    #setWorldGeometry()
    {
        // dünya yüksekliğini hesapla
        const grid = this.#setWorldHeight();

        // Chunk geometri verileri
        var vertex = [];
        var indices = [];

        // Mesh'ler kurulsun
        for (let x = 0; x < worldScale; x++)
        {
            for (let z = 0; z < worldScale; z++)
            {
                const startX = (this.cx * worldScale) + x;
                const startZ = (this.cz * worldScale) + z;

                // Index'leri bul
                const v1 = Math.max(grid[this.#getIndexFromCoord(x, z)], -0.5);
                const v2 = Math.max(grid[this.#getIndexFromCoord(x + 1, z)], -0.5);
                const v3 = Math.max(grid[this.#getIndexFromCoord(x, z + 1)], -0.5);
                const v4 = Math.max(grid[this.#getIndexFromCoord(x + 1, z + 1)], -0.5);

                // Köşeleri yaz
                vertex.push(
                    startX, v1, startZ,
                    startX + 1, v2, startZ,
                    startX, v3, startZ + 1,
                    startX + 1, v4, startZ + 1,
                );

                // indexleri gir
                const index2 = vertex.length / 3;

                indices.push(
                    index2 + 2, index2 + 1, index2,
                    index2 + 1, index2 + 2, index2 + 3,
                );
            }
        }

        // Verileri al
        return { vertex, indices };
    }

    #setWorldMesh()
    {
        // Seçenekler
        const options = {
            faceColor: "#ffea00",
            smoothess: 20,
            amplitude: 25
        };

        // Chunk verilerini al
        var { vertex, indices } = this.#setWorldGeometry();

        // Mesh geometrisini oluştur
        const geometry = new THREE.BufferGeometry();

        // Attribute'ları gir
        geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(vertex), 3)); 

        // Verilen index değerine göre vertexleri gir
        geometry.setIndex(indices);

        // Vertex normal'ı hesapla
        geometry.computeVertexNormals();

        // Mesh material'ı oluştur
        const material = new THREE.MeshStandardMaterial({ color: new THREE.Color(1, 0, 1) });

        // Mesh oluştur
        const mesh = new THREE.Mesh(geometry, material);

        // Mesh renklerini ayarla
        this.gui.addColor(options, "faceColor").onChange(function(e)
        {
            mesh.material.color.set(e);
        });

        // Mesh'i sahneye ata
        this.scene.add(mesh);
    }
}