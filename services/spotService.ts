import faunadb, { query as q } from "faunadb";

var adminClient = new faunadb.Client({
  secret: "fnAD8u47AOACB8eyemkCLFhw8XFJH0jJZcD5DZML",
});

export async function getSpots() {
  return await adminClient.query(
    q.Map(
      q.Paginate(q.Match(q.Index("get_my_spots")), {
        size: 10,
      }),
      q.Lambda(
        "ref",
        q.Let(
          {
            ref: q.Get(q.Var("ref")),
          },
          {
            id: q.Select(["ref", "id"], q.Var("ref")),
            coords: q.Select(["data", "coords"], q.Var("ref")),
            draught: q.Select(["data", "draught"], q.Var("ref")),
            length: q.Select(["data", "length"], q.Var("ref")),
            name: q.Select(["data", "name"], q.Var("ref")),
            price: q.Select(["data", "price"], q.Var("ref")),
            services: q.Select(["data", "services"], q.Var("ref")),
          }
        )
      )
    )
  );
}

export async function createSpot(spotInfo) {
  return await adminClient.query(
    q.Create(q.Collection("spots"), {
      data: spotInfo,
    })
  );
}
