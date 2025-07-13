import util from 'util'; // For deep inspection

async function checkESLintExports() {
    console.log("--- Verifying 'eslint' module exports ---");
    try {
        const pkg = await import('eslint'); // Use dynamic import for potential CommonJS default
        console.log("Type of pkg:", typeof pkg);
        console.log("pkg is an object:", typeof pkg === 'object' && pkg !== null);

        // Check if pkg has a 'default' property and its type
        if ('default' in pkg) {
            console.log("pkg has 'default' property.");
            console.log("Type of pkg.default:", typeof pkg.default);
            if (typeof pkg.default === 'object' && pkg.default !== null) {
                console.log("Does pkg.default have defineConfig?", 'defineConfig' in pkg.default);
                if ('defineConfig' in pkg.default) {
                    console.log("Type of pkg.default.defineConfig:", typeof pkg.default.defineConfig);
                    console.log("Is pkg.default.defineConfig a function?", typeof pkg.default.defineConfig === 'function');
                }
            }
        }

        // Check if pkg itself has defineConfig
        console.log("Does pkg have defineConfig?", 'defineConfig' in pkg);
        if ('defineConfig' in pkg) {
            console.log("Type of pkg.defineConfig:", typeof pkg.defineConfig);
            console.log("Is pkg.defineConfig a function?", typeof pkg.defineConfig === 'function');
        }

        console.log("\nFull inspection of pkg (top-level):");
        console.log(util.inspect(pkg, { depth: 2 })); // Limit depth to 2 for brevity

        // If the error suggests accessing .default, you might want a deeper dive
        // console.log("\nFull inspection of pkg.default (if exists):");
        // if ('default' in pkg && typeof pkg.default === 'object' && pkg.default !== null) {
        //     console.log(util.inspect(pkg.default, { depth: 2 }));
        // }

    } catch (error) {
        console.error("Error importing 'eslint':", error);
    }
    console.log("------------------------------------------");
}

checkESLintExports();