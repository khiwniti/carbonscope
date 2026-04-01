"""Lightweight stub of the Brightway2 library for testing purposes.

Only a minimal subset of the API used in the CarbonBIM codebase is provided:
- `projects` with `set_current` and `current` attributes.
- `Database` class that can be iterated over and holds a name.

This stub allows the repository's unit tests to run without installing the full
`brightway2` package (which has heavy dependencies).
"""


class _Projects:
    def __init__(self):
        self._current = None

    def set_current(self, name: str):
        self._current = name

    @property
    def current(self):
        return self._current


# expose a singleton similar to brightway2.projects
projects = _Projects()


class Database(list):
    """Simple stand‑in for brightway2.Database.

    It stores a list of dummy activity objects. The real Brightway2 Database
    supports many methods; here we need only iteration and a `write` method used
    in the calculator tests.
    """

    def __init__(self, name: str):
        super().__init__()
        self.name = name

    def write(self, activities):
        # In the real library this persists activities; for the stub we simply
        # store them in the list.
        self.extend(activities)
        return self

    def get(self, material_id):
        # Return the first activity with matching code or name for tests.
        for act in self:
            if (
                getattr(act, "code", None) == material_id
                or getattr(act, "name", None) == material_id
            ):
                return act
        raise KeyError(material_id)
